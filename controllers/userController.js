import User from "../models/User.js";
import bcrypt from 'bcryptjs';  // Correct
import asyncHandler from 'express-async-handler';


// REGISTER USER 
export const userRegister = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
  
    try {
        // Vérification de l'existence de l'utilisateur.
        const userExist = await User.findByEmail(email);
        if (userExist) {
            return res.status(400).json({ email: 'User already exists' });
        }
  
        // Creation du user et le hash pwd est déja fait dans le middleware pre('save')). 
        const user = new User({
            name: { firstname, lastname },
            email,
            password,
            role: [{ name: 'user', permissions: ['read'] }]
        });
  
        await user.save();
  
        // Génération d'un token pour l'utilisateur.
        const token = user.generateToken();
  
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json(errors);
        }
        res.status(500).json({ message: 'Server Error' });
    }
  });
  

// LOGIN USER

export const userLogin = asyncHandler(async (req, res) => {
    // Récupération des requetes de l'utilisateur :
    const { email, password } = req.body;
  
    // Vérification de l'existence de l'utilisateur :
    const userFound = await User.findByEmail(email);
  
    // Comparer et vérifier le mot de passe :
    if (userFound && await userFound.comparePassword(password)) {
  
        // Mettre à jour le champ isActive à true
        userFound.isActive = true;
        userFound.lastSeenAt = Date.now();
        await userFound.save();
  
        // Générer le token
        const token = userFound.generateToken();
  
        return res.status(200).json({
            status: 'success',
            message: 'User logged in successfully',
            data: {
              user: userFound,
              token
          }
        })
    }else{
        throw new Error('Looks like either your email address or password were incorrect. Wanna try again?')
    }
  });

// LOGOUT USER 
export const userLogout = asyncHandler(async (req, res) => {
    const userId = req.userAuthId;
  
    // Vérifiez si l'utilisateur est connecté
    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in'
      });
    }
  
    // Récupérer l'utilisateur
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
  
    // Supprimer le cookie authToken
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/', // Assurez-vous que le chemin est correct
    });
  
    // Mettre à jour le champ isActive à false
    userFound.isActive = false;
    await userFound.save();
  
    return res.status(200).json({
      status: 'success',
      message: 'User logged out successfully'
    });
  });
  

// FORGOT PASSWORD