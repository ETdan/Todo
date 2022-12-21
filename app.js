const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const password=encodeURIComponent( process.env.test ) ;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://admin-Etdan:test@cluster0.z547jrv.mongodb.net/TodolidtDB');

const itemsSchema={
  name:String
};

const Item=mongoose.model("item",itemsSchema);

const n=new Item({name:"welcom to your todo list"});
const e=new Item({name:"press + button to add"});
const w=new Item({name:"<--- to remove todo"});

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("notList",listSchema);

const defualtItems=[n,e,w];

app.get("/", function(req, res) {

  Item.find({},(err,result)=>{

    if(result.length===0){
      Item.insertMany(defualtItems,(e)=>{
        if(e)
        console.log("hi");
        else
        console.log("Items have been added successfuly to Db");
      })
      res.redirect("/");
    }else
      res.render("list", {listTitle:"Today", newListItems: result})
    
  })
});

app.get("/:param",(req,res)=>{
  const param=_.capitalize(req.params.param);

  List.findOne({name:param},(err,found)=>{
    if(!err){
      if(!found){
        const list=new List({
          name:param,
          items:defualtItems
        });
        list.save()
        res.redirect("/"+ param)
      }else{
        res.render("list",{ listTitle:found.name, newListItems:found.items})
      }
    }
  })
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
    
  const item=new Item({name:itemName})
  
  if(listName==="Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName},(err,found)=>{
      found.items.push(item);
      found.save();
      res.redirect("/"+ listName);
    })
  }
});

// /////////////////////////////// ALL GOOD /////////////////////////////////////
app.post("/delete",(req,res)=>{
  const checkedId=req.body.checkbox;
  const chechedName=req.body.listName;

  if(chechedName==="Today"){
    Item.findOneAndRemove({_id:checkedId},(err,found)=>{
      if(!err){
        // console.log("removed name:"+checkedId);
        // found.save();
        res.redirect("/")
      }
    });
  }else{
      List.findOneAndUpdate({name:chechedName},{$pull:{items:{_id:checkedId}}},(err,found)=>{
        if(!err){
          res.redirect("/"+chechedName)
        }
      });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;

if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started successfuly");
});