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
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Set up CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)



SECRET_KEY = "TST1234" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
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

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta if expires_delta else datetime.utcnow() + timedelta(hours=12)
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
    class_id: Optional[int] = None 
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
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not verify_password(request_data.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["username"], "role": user_dict["role"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user_dict["user_id"],
        "role": user_dict["role"]  # Include the role in the response
    }


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
    return coaches


@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}

@app.get("/current_user", response_model=User)
async def get_current_user_data(current_user: User = Depends(get_current_user)):
    return current_user

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
    fitness_classes = read_json("fitness_classes.json")
    return fitness_classes

@app.post("/classes", response_model=FitnessClass)
async def add_class(fitness_class: FitnessClass, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")

    fitness_classes = read_json("fitness_classes.json")

    new_class_id = max([f_class["class_id"] for f_class in fitness_classes], default=0) + 1
    new_class = fitness_class.dict()
    new_class["class_id"] = new_class_id  # Assign a new ID
    fitness_classes.append(new_class)

    write_json(fitness_classes, "fitness_classes.json")
    return new_class


@app.put("/classes/{class_id}", response_model=FitnessClass)
async def update_class(class_id: int, updated_class: FitnessClass, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")

    fitness_classes = read_json("fitness_classes.json")  # Reload the latest classes

    for idx, f_class in enumerate(fitness_classes):
        if f_class['class_id'] == class_id:
            fitness_classes[idx] = updated_class.dict()
            fitness_classes[idx]["class_id"] = class_id  # Ensure class ID remains unchanged
            write_json(fitness_classes, "fitness_classes.json")
            return fitness_classes[idx]
    raise HTTPException(status_code=404, detail="Fitness class not found")


@app.delete("/classes/{class_id}", response_model=dict)
async def delete_class(class_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")

    fitness_classes = read_json("fitness_classes.json")  # Reload the latest classes

    fitness_classes = [f_class for f_class in fitness_classes if f_class['class_id'] != class_id]
    write_json(fitness_classes, "fitness_classes.json")
    return {"message": "Fitness class deleted"}


# Endpoints for Registrations
@app.post("/register", response_model=Registration)
async def register_for_class(registration: Registration, current_user: User = Depends(get_current_user)):
    # Reload the current registrations
    registrations = read_json("registrations.json")

    if not any(f_class for f_class in fitness_classes if f_class["class_id"] == registration.class_id):
        raise HTTPException(status_code=404, detail="Fitness class not found")

    if any(reg for reg in registrations if reg["user_id"] == registration.user_id and reg["class_id"] == registration.class_id):
        raise HTTPException(status_code=400, detail="User already registered for this class")
    
    registrations.append(registration.dict())
    write_json(registrations, "registrations.json")
    
    return registration


@app.get("/registrations", response_model=List[Registration])
async def get_user_registrations(current_user: User = Depends(get_current_user)):
    # Reload the registrations from the JSON file
    registrations = read_json("registrations.json")

    user_id = current_user.user_id
    user_registrations = [reg for reg in registrations if reg["user_id"] == user_id]
    return user_registrations

@app.get("/all-registrations", response_model=List[Registration])
async def get_user_registrations(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    # Reload the registrations from the JSON file
    registrations = read_json("registrations.json")

    return registrations

@app.delete("/cancel_registration/{class_id}", response_model=dict)
async def cancel_registration(class_id: int, current_user: User = Depends(get_current_user)):
    # Reload the current registrations
    registrations = read_json("registrations.json")

    # Remove the specific registration
    registrations = [reg for reg in registrations if not (reg["user_id"] == current_user.user_id and reg["class_id"] == class_id)]
    
    write_json(registrations, "registrations.json")

    return {"detail": "Registration cancelled successfully"}

# Endpoint to fetch all users
@app.get("/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    users = read_json("users_db.json")
    return users

# Endpoint to update a user
@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_update: UserRegistration, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    users = read_json("users_db.json")
    user = next((u for u in users if u["user_id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user details
    user["username"] = user_update.username
    user["hashed_password"] = get_password_hash(user_update.password) if user_update.password else user["hashed_password"]
    user["role"] = user_update.role

    write_json(users, "users_db.json")
    return user

# Endpoint to delete a user
@app.delete("/users/{user_id}", response_model=dict)
async def delete_user(user_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    users = read_json("users_db.json")
    if not any(u["user_id"] == user_id for u in users):
        raise HTTPException(status_code=404, detail="User not found")

    updated_users = [u for u in users if u["user_id"] != user_id]
    write_json(updated_users, "users_db.json")
    return {"message": "User deleted successfully"}



