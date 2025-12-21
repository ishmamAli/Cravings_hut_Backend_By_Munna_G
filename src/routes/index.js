const express = require("express");
const userRoute = require("./user.route");
const permissionRoute = require("./permission.route");
const adminRoute = require("./admin.route");
const menuRoute = require("./menu.route");
const tableRoute = require("./tables.route");
const orderRoute = require("./order.route");
const router = express.Router();

const defaultRoutes = [
  {
    path: "/api/user",
    route: userRoute,
  },
  {
    path: "/api/permission",
    route: permissionRoute,
  },
  {
    path: "/api/admin",
    route: adminRoute,
  },
  {
    path: "/api/menu",
    route: menuRoute,
  },
  {
    path: "/api/tables",
    route: tableRoute,
  },
  {
    path: "/api/orders",
    route: orderRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
