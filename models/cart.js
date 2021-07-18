module.exports = function Cart(oldCart){
    this.items= oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add  = function(item ,id){
        // console.log(item);
        var storedItem = this.items[id];
        if(!storedItem){
            storedItem = this.items[id]  ={item :item , qty :0 ,price : 0, img : null}
           
             
        }
        
        storedItem.qty++;
        storedItem.price =storedItem.item.price * storedItem.qty ;
        storedItem.img = item.Image;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
        
    };
    this.generateArray = function(){
        var arr = [];
        for(var id in this.items){
            arr.push(this.items[id]);
            // console.log(this.items[id]);
        }
        return arr;
        
    };

    // this.productarr = function(){
    //     var product = [];
    //     for(var id in this.items){
    //         product.push(this.product[id]);
    //     }
    //     return product;
    // }
}; 

// var mongoose = require('mongoose');

// var cartSchema = new mongoose.Schema({
//     title : String,
//     price : Number,
//     productCode : String,
//     Image : String,
//     Quantity : Number,
//     user: {
//         id: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User'
//         },
//         username: String
//     }
// })

// module.exports  =new mongoose.model('Cart' , cartSchema);