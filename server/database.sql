CREATE DATABASE perntodo;

CREATE TABLE todo(
    todo_id SERIAL PRIMARY KEY,
    todo_giver integer REFERENCES person(person_id),
    todo_target integer REFERENCES person(person_id),
    description VARCHAR(255),
    status BOOLEAN NOT NULL,
    due_time TIMESTAMP
);

CREATE TABLE person(
    person_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    score integer
);