/**
 * @author Dwi Setiyadi
 */

import {
  Home,
} from '../controllers';

export default [
  {
    method: 'GET',
    path: '/',
    handler: (req, res) => Home.getPage(req, res),
  },
  {
    method: 'POST',
    path: '/',
    handler: (req, res) => Home.getPage(req, res),
  },
  {
    method: 'GET',
    path: '/item/{id}',
    handler: (req, res) => Home.viewPage(req, res),
  },
  {
    method: 'GET',
    path: '/data',
    handler: (req, res) => Home.viewAll(req, res),
  },
];
