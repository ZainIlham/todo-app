const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.post("/todos", async(req, res) => {
    try {
        const { todoGiver, todoTarget, description } = req.body;
        const newTodo = await pool.query(
            "INSERT INTO todo (todo_giver, todo_target, description, status) VALUES($1, $2, $3, $4) RETURNING *", 
            [todoGiver, todoTarget, description, false]
        );

        res.status(200).json(newTodo.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

app.get("/todos", async(req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todo");
        res.status(200).json(allTodos.rows);
    } catch (err) {
        console.log(err.message);
    }
})

app.get("/todos/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const todo = await pool.query(
            "SELECT * FROM todo WHERE todo_id = $1",
            [id]
        );

        res.status(200).json(todo.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const updateTodo = await pool.query(
            "UPDATE todo SET description = $1 WHERE todo_id = $2", 
            [description, id]
        );

        res.status(200).json({message: "Successfully update Todo."});
    } catch (err) {
        console.log(err.message);
    }
});

app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteTodo = await pool.query(
            "DELETE FROM todo WHERE todo_id = $1", 
            [id]
        );

        res.status(200).json("Successfully delete Todo")
    } catch (err) {
        console.log(err.message);  
    }
});

app.post("/persons", async (req, res) => {
    try {
        const { name } = req.body;
        const newPerson = await pool.query(
            "INSERT INTO person(name, score) VALUES($1, $2) RETURNING *", 
            [name, 0])
        ;

        res.status(200).json(newPerson.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

app.get("/persons", async (req, res) => {
    try {
        const allPerson = await pool.query("SELECT * FROM person");
        var result = [];
        for (var i = 0; i < allPerson.rowCount; i++) {
            const personTodos = await pool.query(
                "SELECT * FROM todo WHERE todo_target = $1", 
                [allPerson.rows[i].person_id]
            );
            
            let personObj = { 
                person_id: allPerson.rows[i].person_id,
                name: allPerson.rows[i].name,
                score: allPerson.rows[i].score,
                todos: personTodos.rows
            };
            result.push(personObj);
        }
        res.status(200).json(result);
    } catch (err) {
        console.log(err.message);
    }
});

app.put("/persons/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatePerson = await pool.query(
            "UPDATE person SET name = $1 WHERE person_id = $2", 
            [name, id]
        );

        res.status(200).json({message: "Successfully update person"});
    } catch (err) {
        console.log(err.message);
    }
});

app.post("/persons/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { todoId } = req.body;
        const todo = await pool.query(
            "SELECT * FROM todo WHERE todo_id = $1 and todo_target = $2", 
            [todoId, id]
        );
        
        if (todo.rowCount == 0) res.status(200).json({message: "Todo not found"});
        else if (todo.rows[0].status === true) res.status(200).json({message: "Todo is already done"});
        
        await pool.query(
            "UPDATE todo SET status = $1 WHERE todo_id = $2 and todo_target = $3",
            [true, todoId, id]
        );

        const getPerson = await pool.query(
            "SELECT * FROM person WHERE person_id = $1",
            [id]
        );
        var score = parseInt(getPerson.rows[0].score + 1);
        const updatePerson = await pool.query(
            "UPDATE person SET score = $1 WHERE person_id = $2 RETURNING *",
            [score, id]
        )

        res.status(200).json(updatePerson.rows);
    } catch (err) {
        console.log(err.message);
    }
})

app.listen(5000, () => {
    console.log("Server has started on port 5000");
})