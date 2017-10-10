'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './favorite.events';

let FavoriteSchema = new mongoose.Schema({
  userId: String,
  name: {
    type: String,
    maxlength: [100, 'تعداد کاراکترهای وارد شده، بیش از حد مجاز ({MAXLENGTH}) است.'],
    default: ''
  },
  info: {
    type: String,
    maxlength: [200, 'تعداد کاراکترهای وارد شده، بیش از حد مجاز ({MAXLENGTH}) است.'],
    default: ''
  },
  loc: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: Array,
      default: [0, 0]
    }
  }
});

registerEvents(FavoriteSchema);
export default mongoose.model('Favorite', FavoriteSchema);
