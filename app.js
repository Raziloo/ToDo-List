//jshint ensverion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");


const app = express();


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

const day =date.getDay();
Item.find({})
.then(foundItems => {
  if (foundItems.length === 0) {
    return Item.insertMany(defaultItems);
  } else {
    return foundItems;
  }
})
.then(items => {
  res.render("list", {
    listTitle: day,
    newListItems: items
  });
})
.catch(err => console.error(err));

});

app.post("/", function(req, res) {
    const listName = req.body.list.split(',')[0];
    const itemName = req.body.newItem; 
    const today = date.getDay().split(',')[0];

    const item = new Item({
        name: itemName
    });

    if (listName === today) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
        .then(foundList => {
            if (foundList) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            } else {
                const newList = new List({
                    name: listName,
                    items: [item]
                });
                newList.save();
                res.redirect("/" + listName);
            }
        })
        .catch(err => console.log(err));
    }
});



app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName.split(',')[0];
    const today = date.getDay().split(',')[0];

    if (listName === today) {
        Item.deleteOne({ _id: checkedItemId })
        .then(result => {
             console.log("Successfully deleted the document.");
                res.redirect("/");
         })
         .catch(err => console.error(err));
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
        .then(foundList => {
            res.redirect("/" + listName);
            console.log("Successfully deleted the document.");
    })
    .catch(err => console.error(err));
}
});

app.get("/:customListName",function(req,res){
    const customListName = req.params.customListName;
   
    List.findOne({name:customListName})
      .then(function(foundList){
          
            if(!foundList){
              const list = new List({
                name:customListName,
                items:defaultItems
              });
            
              list.save();
              console.log("saved");
              res.redirect("/"+customListName);
            }
            else{
              res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
            }
      })
      .catch(function(err){});
   
  })

app.post("/work", function(req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function(req, res) {
    res.render("about");
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
});

