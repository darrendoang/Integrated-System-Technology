from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json

app = FastAPI()

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


@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}
# Endpoints for Coaches
@app.get("/coaches", response_model=List[Coach])
async def get_coaches():
    return coaches

@app.post("/coaches", response_model=Coach)
async def add_coach(coach: Coach):
    if any(c["coach_id"] == coach.coach_id for c in coaches):
        raise HTTPException(status_code=400, detail="Coach with this ID already exists")
    coaches.append(coach.dict())
    write_json(coaches, "coaches.json")
    return coach

@app.put("/coaches/{coach_id}", response_model=Coach)
async def update_coach(coach_id: int, updated_coach: Coach):
    for idx, c in enumerate(coaches):
        if c['coach_id'] == coach_id:
            coaches[idx] = updated_coach.dict()
            write_json(coaches, "coaches.json")
            return updated_coach
    raise HTTPException(status_code=404, detail="Coach not found")

@app.delete("/coaches/{coach_id}", response_model=dict)
async def delete_coach(coach_id: int):
    global coaches
    coaches = [coach for coach in coaches if coach['coach_id'] != coach_id]
    write_json(coaches, "coaches.json")
    return {"message": "Coach deleted"}

# Endpoints for Fitness Classes
@app.get("/classes", response_model=List[FitnessClass])
async def get_classes():
    return fitness_classes

@app.post("/classes", response_model=FitnessClass)
async def add_class(fitness_class: FitnessClass):
    if any(f_class["class_id"] == fitness_class.class_id for f_class in fitness_classes):
        raise HTTPException(status_code=400, detail="Class with this ID already exists")
    fitness_classes.append(fitness_class.dict())
    write_json(fitness_classes, "fitness_classes.json")
    return fitness_class

@app.put("/classes/{class_id}", response_model=FitnessClass)
async def update_class(class_id: int, updated_class: FitnessClass):
    for idx, f_class in enumerate(fitness_classes):
        if f_class['class_id'] == class_id:
            fitness_classes[idx] = updated_class.dict()
            write_json(fitness_classes, "fitness_classes.json")
            return updated_class
    raise HTTPException(status_code=404, detail="Fitness class not found")

@app.delete("/classes/{class_id}", response_model=dict)
async def delete_class(class_id: int):
    global fitness_classes
    fitness_classes = [f_class for f_class in fitness_classes if f_class['class_id'] != class_id]
    write_json(fitness_classes, "fitness_classes.json")
    return {"message": "Fitness class deleted"}

# Endpoints for Registrations
@app.post("/register", response_model=Registration)
async def register_for_class(registration: Registration):
    if not any(f_class for f_class in fitness_classes if f_class["class_id"] == registration.class_id):
        raise HTTPException(status_code=404, detail="Fitness class not found")
    if any(reg for reg in registrations if reg["user_id"] == registration.user_id and reg["class_id"] == registration.class_id):
        raise HTTPException(status_code=400, detail="User already registered for this class")
    registrations.append(registration.dict())
    write_json(registrations, "registrations.json")
    return registration

@app.get("/registrations", response_model=List[Registration])
async def get_registrations():
    return registrations
