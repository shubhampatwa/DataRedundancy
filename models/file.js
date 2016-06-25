var mongoose=require('mongoose');

var FileSchema=new mongoose.Schema({
	file_name:String,
	hash:String,
	user:{type:mongoose.Schema.Types.ObjectId,ref:'user'}
});

module.exports=mongoose.model('File',FileSchema);