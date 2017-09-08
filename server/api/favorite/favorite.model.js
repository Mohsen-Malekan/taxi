'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './favorite.events';

var FavoriteSchema = new mongoose.Schema({
  userId: String,
  name: String,
  info: String,
  location: {}
});

registerEvents(FavoriteSchema);
export default mongoose.model('Favorite', FavoriteSchema);
