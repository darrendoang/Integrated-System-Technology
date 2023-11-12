from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
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
    username: str
    hashed_password: str
    disabled: bool = False

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



@app.post("/token", response_model=Token)
async def login_for_access_token(request_data: UserLoginRequest):
    users = read_json("users_db.json")
    user_dict = next((user for user in users if user["username"] == request_data.username), None)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username")
    if not verify_password(request_data.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["username"]}, expires_delta=access_token_expires
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
    return coaches


@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}


@app.post("/coaches", response_model=Coach)
async def add_coach(coach: Coach, current_user: User = Depends(get_current_user)):
    if any(c["coach_id"] == coach.coach_id for c in coaches):
        raise HTTPException(status_code=400, detail="Coach with this ID already exists")
    coaches.append(coach.dict())
    write_json(coaches, "coaches.json")
    return coach

@app.put("/coaches/{coach_id}", response_model=Coach)
async def update_coach(coach_id: int, updated_coach: Coach, current_user: User = Depends(get_current_user)):
    for idx, c in enumerate(coaches):
        if c['coach_id'] == coach_id:
            coaches[idx] = updated_coach.dict()
            write_json(coaches, "coaches.json")
            return updated_coach
    raise HTTPException(status_code=404, detail="Coach not found")

@app.delete("/coaches/{coach_id}", response_model=dict)
async def delete_coach(coach_id: int, current_user: User = Depends(get_current_user)):
    global coaches
    coaches = [coach for coach in coaches if coach['coach_id'] != coach_id]
    write_json(coaches, "coaches.json")
    return {"message": "Coach deleted"}

# Endpoints for Fitness Classes
@app.get("/classes", response_model=List[FitnessClass])
async def get_classes():
    return fitness_classes

@app.post("/classes", response_model=FitnessClass)
async def add_class(fitness_class: FitnessClass, current_user: User = Depends(get_current_user)):
    if any(f_class["class_id"] == fitness_class.class_id for f_class in fitness_classes):
        raise HTTPException(status_code=400, detail="Class with this ID already exists")
    fitness_classes.append(fitness_class.dict())
    write_json(fitness_classes, "fitness_classes.json")
    return fitness_class

@app.put("/classes/{class_id}", response_model=FitnessClass)
async def update_class(class_id: int, updated_class: FitnessClass, current_user: User = Depends(get_current_user)):
    for idx, f_class in enumerate(fitness_classes):
        if f_class['class_id'] == class_id:
            fitness_classes[idx] = updated_class.dict()
            write_json(fitness_classes, "fitness_classes.json")
            return updated_class
    raise HTTPException(status_code=404, detail="Fitness class not found")

@app.delete("/classes/{class_id}", response_model=dict)
async def delete_class(class_id: int, current_user: User = Depends(get_current_user)):
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
    return registrations
