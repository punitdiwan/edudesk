/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    2/14/19 12:30 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

const User = require('../../../models/user');
const apiUtils = require('../apiUtils');

const commonV2 = {};

commonV2.login = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) return apiUtils.sendApiError_InvalidPostData(res);

  try {
    const user = await User.getUserByUsername(username);
    if (!user) return apiUtils.sendApiError(res, 401, 'Invalid Username/Password - commonV2.login');

    if (!User.validate(password, user.password))
      return apiUtils.sendApiError(res, 401, 'Invalid Username/Password - commonV2.login');

    const tokens = await apiUtils.generateJWTToken(user);
    // const tokens = (apiUtils.generateJWTToken = function (user) {
    //   const nconf = require('nconf');
    //   const jwt = require('jsonwebtoken');

    //   const resUser = _.clone(user._doc);
    //   const refreshToken = resUser.accessToken;
    //   delete resUser.resetPassExpire;
    //   delete resUser.resetPassHash;
    //   delete resUser.password;
    //   delete resUser.iOSDeviceTokens;
    //   delete resUser.tOTPKey;
    //   delete resUser.__v;
    //   delete resUser.preferences;
    //   delete resUser.accessToken;
    //   delete resUser.deleted;
    //   delete resUser.hasL2Auth;

    //   const secret = nconf.get('tokens') ? nconf.get('tokens').secret : false;
    //   const expires = nconf.get('tokens') ? nconf.get('tokens').expires : 3600;

    //   require('../../models/group').getAllGroupsOfUserNoPopulate(dbUser._id, function (err, grps) {
    //     if (err) return;
    //     resUser.groups = grps.map(function (g) {
    //       return g._id;
    //     });

    //     const token = jwt.sign({ user: resUser }, secret, { expiresIn: expires });

    //     return callback(null, { token: token, refreshToken: refreshToken });
    //   });
    // });

    return apiUtils.sendApiSuccess(res, { token: tokens.token, refreshToken: tokens.refreshToken });
  } catch (e) {
    return apiUtils.sendApiError(res, 500, e.message);
  }
};

commonV2.token = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return apiUtils.sendApiError_InvalidPostData(res);

  try {
    const user = await User.getUserByAccessToken(refreshToken);
    if (!user) return apiUtils.sendApiError(res, 401);

    const tokens = await apiUtils.generateJWTToken(user);

    return apiUtils.sendApiSuccess(res, { token: tokens.token, refreshToken: tokens.refreshToken });
  } catch (e) {
    return apiUtils.sendApiError(res, 500, e.message);
  }
};

commonV2.viewData = async (req, res) => {
  return apiUtils.sendApiSuccess(res, { viewdata: req.viewdata });
};

module.exports = commonV2;
