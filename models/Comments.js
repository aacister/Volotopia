var mongoose = require('mongoose');
mongoose.set('debug', true);

var CommentSchema = new mongoose.Schema({
    body: String,
    author: String,
    upvotes: {
        type: Number,
        default: 0
    },
    airline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airline'
    }
});

CommentSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};

mongoose.model('Comment', CommentSchema);
