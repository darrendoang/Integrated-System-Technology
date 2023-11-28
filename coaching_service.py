from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import json
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import status
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()

class User(BaseModel):
    user_id: int
    username: str
    hashed_password: str
    disabled: bool = False
    role: str  

# New model for user registration
class UserRegistration(BaseModel):
    username: str
    password: str
    role: str

class UserHealthData(BaseModel):
    user_id: int
    weight: float = Field(gt=0, description="Weight in kilograms")
    height: float = Field(gt=0, description="Height in centimeters")
    age: int = Field(gt=0, description="Age in years")
    gender: str = Field(pattern="^(male|female)$", description="Gender: 'male' or 'female'")
    goal: str = Field(pattern="^(maintain|mild_loss|loss|extreme_loss|mild_gain|gain|extreme_gain)$", description="Goal for weight management")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)



SECRET_KEY = "TST1234" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta if expires_delta else datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    to_encode.update({"role": data["role"]}) 
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Models
class Coach(BaseModel):
    coach_id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    experience_years: int
    hourly_rate_idr: int
    availability: str
    bio: str

class FitnessClass(BaseModel):
    class_id: int
    coach_id: int
    start_time: str
    end_time: str
    class_type: str

class Registration(BaseModel):
    user_id: int
    class_id: int

class UserLoginRequest(BaseModel):
    username: str
    password: str
# Utility functions to read and write JSON files
def read_json(filename):
    with open(filename, "r") as file:
        return json.load(file)

def write_json(data, filename):
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)


# Initialize or read data
try:
    coaches = read_json("coaches.json")
except FileNotFoundError:
    coaches = []
    write_json(coaches, "coaches.json")

try:
    fitness_classes = read_json("fitness_classes.json")
except FileNotFoundError:
    fitness_classes = []
    write_json(fitness_classes, "fitness_classes.json")

try:
    registrations = read_json("registrations.json")
except FileNotFoundError:
    registrations = []
    write_json(registrations, "registrations.json")



@app.post("/signup", response_model=User)
async def create_user(user: UserRegistration):
    users = read_json("users_db.json")

    # Assign a new user_id
    if users:  # if there are already users in the db
        new_user_id = max(user["user_id"] for user in users) + 1
    else:
        new_user_id = 1

    if any(u["username"] == user.username for u in users):
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = get_password_hash(user.password)
    new_user = {
        "user_id": new_user_id,  # use the new user_id
        "username": user.username,
        "hashed_password": hashed_password,
        "disabled": False,
        "role": user.role
    }
    users.append(new_user)
    write_json(users, "users_db.json")
    return new_user


@app.post("/login", response_model=Token)
async def login_for_access_token(request_data: UserLoginRequest):
    users = read_json("users_db.json")
    user_dict = next((user for user in users if user["username"] == request_data.username), None)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username")
    if not verify_password(request_data.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["username"], "role": user_dict["role"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        users = read_json("users_db.json")
        user_dict = next((user for user in users if user["username"] == username), None)
        if user_dict is None:
            raise credentials_exception
        return User(**user_dict)
    except JWTError:
        raise credentials_exception

# Endpoints for Coaches
@app.get("/coaches", response_model=List[Coach])
async def get_coaches(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    return coaches


@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}


@app.post("/coaches", response_model=Coach)
async def add_coach(coach: Coach, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    if any(c["coach_id"] == coach.coach_id for c in coaches):
        raise HTTPException(status_code=400, detail="Coach with this ID already exists")
    coaches.append(coach.dict())
    write_json(coaches, "coaches.json")
    return coach

@app.put("/coaches/{coach_id}", response_model=Coach)
async def update_coach(coach_id: int, updated_coach: Coach, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    for idx, c in enumerate(coaches):
        if c['coach_id'] == coach_id:
            coaches[idx] = updated_coach.dict()
            write_json(coaches, "coaches.json")
            return updated_coach
    raise HTTPException(status_code=404, detail="Coach not found")

@app.delete("/coaches/{coach_id}", response_model=dict)
async def delete_coach(coach_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    global coaches
    coaches = [coach for coach in coaches if coach['coach_id'] != coach_id]
    write_json(coaches, "coaches.json")
    return {"message": "Coach deleted"}

# Endpoints for Fitness Classes
@app.get("/classes", response_model=List[FitnessClass])
async def get_classes(current_user: User = Depends(get_current_user)):
    return fitness_classes

@app.post("/classes", response_model=FitnessClass)
async def add_class(fitness_class: FitnessClass, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    if any(f_class["class_id"] == fitness_class.class_id for f_class in fitness_classes):
        raise HTTPException(status_code=400, detail="Class with this ID already exists")
    fitness_classes.append(fitness_class.dict())
    write_json(fitness_classes, "fitness_classes.json")
    return fitness_class

@app.put("/classes/{class_id}", response_model=FitnessClass)
async def update_class(class_id: int, updated_class: FitnessClass, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    for idx, f_class in enumerate(fitness_classes):
        if f_class['class_id'] == class_id:
            fitness_classes[idx] = updated_class.dict()
            write_json(fitness_classes, "fitness_classes.json")
            return updated_class
    raise HTTPException(status_code=404, detail="Fitness class not found")

@app.delete("/classes/{class_id}", response_model=dict)
async def delete_class(class_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    global fitness_classes
    fitness_classes = [f_class for f_class in fitness_classes if f_class['class_id'] != class_id]
    write_json(fitness_classes, "fitness_classes.json")
    return {"message": "Fitness class deleted"}

# Endpoints for Registrations
@app.post("/register", response_model=Registration)
async def register_for_class(registration: Registration, current_user: User = Depends(get_current_user)):
    if not any(f_class for f_class in fitness_classes if f_class["class_id"] == registration.class_id):
        raise HTTPException(status_code=404, detail="Fitness class not found")
    if any(reg for reg in registrations if reg["user_id"] == registration.user_id and reg["class_id"] == registration.class_id):
        raise HTTPException(status_code=400, detail="User already registered for this class")
    registrations.append(registration.dict())
    write_json(registrations, "registrations.json")
    return registration

@app.get("/registrations", response_model=List[Registration])
async def get_registrations(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    return registrations

# @app.post("/submit_health_data", response_model=UserHealthData)
# async def submit_health_data(health_data: UserHealthData, current_user: User = Depends(get_current_user)):
#     # Load the existing health data
#     try:
#         user_health_data = read_json("user_health_data.json")
#     except FileNotFoundError:
#         user_health_data = []
    
#     # Check if the current user already has submitted data
#     for data in user_health_data:
#         if data['user_id'] == current_user.user_id:
#             raise HTTPException(
#                 status_code=400, 
#                 detail="Health data for this user already exists. Use the update endpoint instead."
#             )
    
#     # Append the new health data
#     user_health_data.append(health_data.dict())
    
#     # Save the updated health data
#     write_json(user_health_data, "user_health_data.json")
    
#     return health_data
# @app.get("/get_health_data")
# async def get_health_data(current_user: User = Depends(get_current_user)):
#     try:
#         # Load all health data
#         user_health_data = read_json("user_health_data.json")
#     except FileNotFoundError:
#         raise HTTPException(status_code=404, detail="Health data not found")

#     # Find health data for the current user
#     user_data = next((data for data in user_health_data if data["user_id"] == current_user.user_id), None)
    
#     if user_data is None:
#         raise HTTPException(status_code=404, detail="No health data found for the user")

#     return user_data


# @app.delete("/delete_health_data")
# async def delete_health_data(current_user: User = Depends(get_current_user)):
#     try:
#         # Load all health data
#         user_health_data = read_json("user_health_data.json")
#     except FileNotFoundError:
#         raise HTTPException(status_code=404, detail="Health data not found")

#     # Filter out the health data for the current user
#     user_health_data = [data for data in user_health_data if data["user_id"] != current_user.user_id]
    
#     # Save the updated health data back to the file
#     write_json(user_health_data, "user_health_data.json")

#     return {"detail": "Health data deleted successfully"}

@app.get("/get_bmr_and_class_recommendation")
async def get_bmr_and_class_recommendation(current_user: User = Depends(get_current_user)):
    try:
        # Load all class recommendations
        class_recommendations = read_json("class_recommendations.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Class recommendations not found")

    # Find recommendation for the current user
    user_recommendation = next((rec for rec in class_recommendations if rec["user_id"] == current_user.user_id), None)
    
    if user_recommendation is None:
        raise HTTPException(status_code=404, detail="No recommendation found for the user")

    return user_recommendation

@app.delete("/delete_bmr_and_class_recommendation")
async def delete_bmr_and_class_recommendation(current_user: User = Depends(get_current_user)):
    try:
        # Load all class recommendations
        class_recommendations = read_json("class_recommendations.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Class recommendations not found")

    # Filter out the recommendation for the current user
    class_recommendations = [rec for rec in class_recommendations if rec["user_id"] != current_user.user_id]
    
    # Save the updated recommendations back to the file
    write_json(class_recommendations, "class_recommendations.json")

    return {"detail": "Recommendation deleted successfully"}


def calculate_bmr(weight, height, age, gender, goal):
    goal_multipliers = {
        'maintain': 1.0,
        'mild_loss': 0.83,
        'loss': 0.66,
        'extreme_loss': 0.32,
        'mild_gain': 1.17,
        'gain': 1.34,
        'extreme_gain': 1.68
    }
    if gender == 'male':
        bmr = (10 * weight + 6.25 * height - 5 * age + 5)
    else:
        bmr = (10 * weight + 6.25 * height - 5 * age - 161)
    return bmr * goal_multipliers[goal]


@app.post("/get_bmr_and_class_recommendation")
async def get_bmr_and_class_recommendation(health_data: UserHealthData, current_user: User = Depends(get_current_user)):
    # Calculate the BMR with the provided health data
    bmr = calculate_bmr(health_data.weight, health_data.height, health_data.age, health_data.gender, health_data.goal)
    
    # Get a class recommendation based on the user's goal
    class_recommendation = get_class_recommendation(health_data.goal, bmr)
    
    # Prepare the recommendation data
    recommendation = {
        "user_id": current_user.user_id,
        "bmr": bmr,
        "class_recommendation": class_recommendation
    }
    
    # Save the recommendation data to class_recommendations.json
    try:
        class_recommendations = read_json("class_recommendations.json")
    except FileNotFoundError:
        class_recommendations = []

    class_recommendations.append(recommendation)
    write_json(class_recommendations, "class_recommendations.json")

    return recommendation

def get_class_recommendation(goal, bmr):
    # Read the fitness classes data
    try:
        fitness_classes = read_json("fitness_classes.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Fitness classes data not found")
    
    # Simple logic for class recommendation based on goal and BMR
    if goal in ['mild_loss', 'loss', 'extreme_loss'] and bmr < 2000:
        # For weight loss goals, classes with higher calorie burn are preferable
        class_types = ['HIIT', 'Cardio', 'Abs Training']
    elif goal in ['mild_gain', 'gain', 'extreme_gain'] and bmr >1500:
        # For weight gain goals, consider classes that focus on muscle building
        class_types = ['MUSCLE Training', 'Abs Training']
    else:  # 'maintain'
        # For maintaining weight, a balance of different class types could be suggested
        class_types = ['Yoga', 'Pilates', 'MUSCLE Training', 'Abs Training']

    # Filter classes based on types that match the goal
    suitable_classes = [c for c in fitness_classes if c['class_type'] in class_types]


    if not suitable_classes:
        raise HTTPException(status_code=404, detail="No suitable fitness class found for the goal")

    # Return a random suitable class for variation
    # In a real-world scenario, you might want to implement a more sophisticated selection process
    import random
    return random.choice(suitable_classes)
