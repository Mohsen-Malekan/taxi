'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './favorite.events';

let FavoriteSchema = new mongoose.Schema({
  userId : String,
  name   : String,
  info   : String,
  lat    : Number,
  lng    : Number
});

registerEvents(FavoriteSchema);
export default mongoose.model('Favorite', FavoriteSchema);
