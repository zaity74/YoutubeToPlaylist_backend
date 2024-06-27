import express from 'express';
import { addListeningHistory, getListeningHistory } from '../controllers/listenningHistoryController.js';
import  isLoggedIn  from '../middlewares/isLoggedIn.js';

const historyRouter = express.Router();

historyRouter.post('/add-history', isLoggedIn, addListeningHistory);
historyRouter.get('/get-history', isLoggedIn, getListeningHistory);

export default historyRouter;
