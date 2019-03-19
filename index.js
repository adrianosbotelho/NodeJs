const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const app = express();
const Joi = require('joi');
const logger = require('./logger');

//console.log(`NODE_ENV: ${process.env.NODE_ENV} `);
//console.log(`app: ${app.get('env')}`)


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());

//Configuration
console.log('Application name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));
console.log('Mail Password: ' + config.get('mail.password'));

if (app.get('env') === 'development'){
    app.use(morgan('tiny'));
    console.log('Morgan enabled...')
}

app.use(logger);

app.use(function(req, resp, next) {
    console.log('Autheticating...');
   next();
});


const courses = [
    {id: 1, name: 'course 1'},
    {id: 2, name: 'course 2'},
    {id: 3, name: 'course 3'}
]

app.get('/',(req, res) => {
    res.send('hello World!!!');
});


app.get('/api/courses',(req, res) => {
    res.send(courses);
});


app.post('/api/courses', (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const course = {
        id : courses.length + 1,
        name : req.body.name
    };
    courses.push(course);
    res.send(course);

});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('Curso não encontrado');
    
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

   course.name = req.body.name;
   res.send(course);

})

function validateCourse(course){
    const schema = {
        name: Joi.string().min(3).required()
    };  
    return Joi.validate(course,schema);
}

app.get('/api/courses/:id',(req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('Curso não encontrado');
    res.send(course);
});


app.get('/api/posts/:year/:month',(req, res) => {
    res.send(req.query);
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('Curso não encontrado');

    const index = courses.indexOf(course);
    courses.splice(index,1);

    res.send(course);
});

//port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
