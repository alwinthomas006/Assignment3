const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));

const mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching employees', 
            error: error.message 
        });
    }
});

app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ 
                message: 'Employee not found' 
            });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching employee', 
            error: error.message 
        });
    }
});

app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        
        if (!name || !location || !position || !salary) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }
        
        const newEmployee = new Employee({
            name,
            location,
            position,
            salary
        });
        
        const savedEmployee = await newEmployee.save();
        res.status(201).json({
            message: 'Employee added successfully',
            employee: savedEmployee
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error adding employee', 
            error: error.message 
        });
    }
});

app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ 
                message: 'Employee not found' 
            });
        }
        res.status(200).json({
            message: 'Employee deleted successfully',
            employee: deletedEmployee
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting employee', 
            error: error.message 
        });
    }
});

app.put('/api/employeelist', async (req, res) => {
    try {
        const { _id, name, location, position, salary } = req.body;
        
        if (!_id) {
            return res.status(400).json({ 
                message: 'Employee ID is required' 
            });
        }
        
        const updatedEmployee = await Employee.findByIdAndUpdate(
            _id,
            { name, location, position, salary },
            { new: true, runValidators: true }
        );
        
        if (!updatedEmployee) {
            return res.status(404).json({ 
                message: 'Employee not found' 
            });
        }
        
        res.status(200).json({
            message: 'Employee updated successfully',
            employee: updatedEmployee
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating employee', 
            error: error.message 
        });
    }
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
