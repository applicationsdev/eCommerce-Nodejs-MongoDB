/* Requires */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var schema = mongoose.Schema;

/* User model definition */
var userModel = new schema({
    
    // Not "nullable" - Required at Signup in current version
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    
    // "Nullable" - Not required at Signup in current version
    security_info: {
        // These 2 fields are set for use in next commits
        verify_token: { type: String, default: '' },
        state: { type: String, default: '' }
    },
    photo: { type: String, default: 'https://via.placeholder.com/150x150' },
    address_line1: { type: String, default: '' },
    address_line2: { type: String, default: '' },
    country_code: { type: String, default: '' },
    postal_code: { type: String, default: '' },
    tel: { type: String, default: '' }
});

/* Signup - hash user password before save to DB */
userModel.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

/* Signup - generate user photo using Gravatar API */
userModel.methods.generatePhoto = function() {
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=150&d=wavatar';
};

/* Login - validate user password */
userModel.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

/* User model export */
module.exports = mongoose.model('User', userModel);
