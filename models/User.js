import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const Schema = mongoose.Schema;

const emailRegexPattern = /\S+@\S+\.\S+/;

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user'
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'update']
  }]
}, { _id: false });

const userSchema = new Schema({
  name: {
    firstname: {
      type: String,
      required: [true, 'Please enter your firstname']
    },
    lastname: {
      type: String,
      required: [true, 'Please enter your lastname']
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [10, 'Password must be at least 10 characters'],
  },
  passwordChangeAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    validate: {
      validator: function(email) {
        return emailRegexPattern.test(email);
      },
      message: 'Please enter a valid email'
    },
    unique: true,
  },
  // date_birth: {
  //   type: Date,
  //   required: [true, 'Please enter your date of birth'],
  //   validate: {
  //     validator: function(date) {
  //       const today = new Date();
  //       const ageDiff = today.getFullYear() - date.getFullYear();
  //       const monthDiff = today.getMonth() - date.getMonth();
  //       const dayDiff = today.getDate() - date.getDate();
  //       if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
  //         ageDiff--;
  //       }
  //       return ageDiff >= 16;
  //     },
  //     message: 'You must be at least 16 years old to register.'
  //   }
  // },
  role: [roleSchema],
  isActive: {
    type: Boolean,
    default: true,
    required: true,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// ################ METHODS INSTANCES DE DOCUMENTS

/* ------ compare hashed pwd with user entered password -------------------------- 
  dans la base de données pour savoir si l'utilisateur 
  fournit les bonnes infos d'identification
*/ 

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ------ generate token after auth -------------------------- */
userSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_KEY, { expiresIn: '3d' });
};

/* ------ Méthode pour générer un token de réinitialisation de mot de passe ------ */
const secret = process.env.JWT_KEY;
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = jwt.sign({ id: this._id }, process.env.JWT_KEY, { expiresIn: '10m' });
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// ################ METHODES STATICS 
/* ------ Find user by email -------------------------- 
  dans la base de données pour savoir si l'utilisateur 
  fournit les bonnes infos d'identification
*/ 

userSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email });
};

// ################ PRE SAVE METHODS
/* ------ Hasher le mots de passe avant la sauvegarde du model ----- */

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

/* ------ 
Middleware pour mettre à jour le champ passwordChangedAt quand 
le mot de passe est modifié 
------- */ 

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// ################ MODEL SAVE  
const User = mongoose.model('User', userSchema);
export default User;