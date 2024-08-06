const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function create (req, res){
     const { data : { deliverTo, mobileNumber, status, dishes = [] } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes: dishes.map(dish => ({
            id: dish.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            image_url: dish.image_url,
            quantity: dish.quantity,
        })), 
    };

    orders.push(newOrder);
    res.status(201).json({data: newOrder});
}

function deliverToPropertyIsPresentAndValid(req, res, next){
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo && deliverTo.length > 0){
        return next();
    } 
    next({
        status: 400,
        message: 'Order must include a deliverTo',
    });
}

function statusToPropertyIsValid(req, res, next){
    const { data: { status } = {} } = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (validStatus.includes(status) && status && status.length > 0 ){
        return next();
    } 
    next({
        status: 400,
        message: 'Order must include a status',
    });
}

function mobileNumberToPropertyIsPresentAndValid(req, res, next){
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber && mobileNumber.length > 0){
        return next();
    } 
    next({
        status: 400,
        message: 'Order must include a mobileNumber',
    });
}


function dishesPropertyIsValid(req, res, next){
    const { data: { dishes = [] } = {} } = req.body;
    if (Array.isArray(dishes) && dishes.length > 0){
        return next();
    } 
    next({
        status: 400,
        message: 'Order must include at least one dish',
    });
};

function quantityPropertyIsValid(req, res, next){
    const { data: {  dishes = [] } = {} } = req.body;
    const index = dishes.findIndex((dish) => !dish.hasOwnProperty('quantity') || !Number.isInteger(dish.quantity) || dish.quantity <=0);
    if (index === -1){
        return next();
    } 
    next({
        status: 400,
        message: `dish ${index} must have a quantity that is an integer greater than 0`,
    });
};

function orderExists(req, res, next){
    const orderId  = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);

    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    } 
    next({
        status: 404,
        message: `Order id is not found: ${orderId}`,
    });
}

function read (req, res){
    res.json({ data: res.locals.order });
}

function list (req, res){
    res.json ({ data: orders });
}

function update(req, res){
    const { orderId } = req.params;
    const order = res.locals.order;
    const { data : { id, deliverTo, mobileNumber, status, dishes = [] } = {} } = req.body;
  
     if (id && id !== orderId) { 
       return res.status(400).json({ error: `Order id: ${id}` });
      }
  
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes.quantity = dishes.quantity;

    res.json({ data: order });
}

function destroy(req, res){
    const { orderId } = req.params;
    const index = orders.findIndex(order => order.id === orderId);
  
    if (orders[index].status !== "pending") {
        return res.status(400).json({ error: 'Order is not pending' });
    }
  
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [
        deliverToPropertyIsPresentAndValid, 
        mobileNumberToPropertyIsPresentAndValid,
        dishesPropertyIsValid,
        quantityPropertyIsValid,
        create],
    read: [
        orderExists,
        read],
    update: [
        orderExists,
        deliverToPropertyIsPresentAndValid, 
        mobileNumberToPropertyIsPresentAndValid,
        statusToPropertyIsValid,
        dishesPropertyIsValid,
        quantityPropertyIsValid,
        update],
    delete: [orderExists, destroy],
};