const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function create(req, res){
    const { data : { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish});
}

function namePropertyIsPresentAndValid(req, res, next){
    const { data: { name } = {} } = req.body;
    if (name && name.length > 0){
        return next();
    } 
    next({
        status: 400,
        message: 'Dish must include a name',
    });
}

function descriptionPropertyIsPresentAndValid(req, res, next){
    const { data: { description } = {} } = req.body;
    if (description && description.length > 0){
        return next();
    } 
    next({
        status: 400,
        message: 'Dish must include a description',
    });
}

function imageUrlPropertyIsPresentAndValid(req, res, next){
    const { data: { image_url } = {} } = req.body;
    if (image_url && image_url.length > 0){
        return next();
    } 
    next({
        status: 400,
        message: 'Dish must include a image_url',
    });
}

function pricePropertyIsValid(req, res, next){
    const { data: { price } = {} } = req.body;
    if (price >=1   && Number.isInteger(price)){
        return next();
    } 
    next({
        status: 400,
        message: 'Dish must have a price that is an integer greater than 0',
    });
};

function DishExists(req, res, next){
    const dishId  = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id is not found: ${dishId}`,
    });
}

function read (req, res){
    res.json({ data: res.locals.dish });
}

function list (req, res){
    res.json ({ data: dishes });
};

function update(req, res){
    const { dishId } = req.params;
    const dish = res.locals.dish;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
  
    if (id && id !== dishId) { 
       return res.status(400).json({ error: `Dish id: ${id}` });
    }
  
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
}

module.exports = {
    list,
    create: [
        namePropertyIsPresentAndValid,
        descriptionPropertyIsPresentAndValid,
        imageUrlPropertyIsPresentAndValid,
        pricePropertyIsValid,
        create
    ],
    read: [DishExists, read],
    update: [
        DishExists,
        namePropertyIsPresentAndValid,
        descriptionPropertyIsPresentAndValid,
        imageUrlPropertyIsPresentAndValid,
        pricePropertyIsValid,
        update,
    ],
};

