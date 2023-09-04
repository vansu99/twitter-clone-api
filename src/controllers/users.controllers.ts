import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';
import { HttpStatusCode } from '~/constants/httpStatusCode.enum';
import { ValidationMessage } from '~/constants/messages.enum';
import {
  TLoginReqBody,
  TSignOutReqBody,
  TSignUpReqBody,
  TokenPayload,
} from '~/models/requests/User.requests';
import databaseService from '~/services/database.services';
import usersServices from '~/services/users.services';

// Sign-In Controller
export const signInController = async (
  req: Request<ParamsDictionary, any, TLoginReqBody>,
  res: Response,
) => {
  const { user } = req;
  const userId = user?._id as ObjectId;
  const result = await usersServices.signIn({
    user_id: userId.toString(),
    verify: user?.verify || UserVerifyStatus.VERIFIED,
  });
  res.status(HttpStatusCode.CREATED).json({
    message: 'Login successful',
    result,
  });
};

// Sign-Up Controller
export const signUpController = async (
  req: Request<ParamsDictionary, any, TSignUpReqBody>,
  res: Response,
) => {
  const result = await usersServices.signUp(req.body);
  res.status(HttpStatusCode.CREATED).json({
    message: 'Register successful',
    result,
  });
};

// Sign-Out Controller
export const signOutController = async (
  req: Request<ParamsDictionary, any, TSignOutReqBody>,
  res: Response,
) => {
  const { refresh_token } = req.body;
  const { decoded_refresh_token } = req;
  const result = await usersServices.signOut(refresh_token);
  res.status(HttpStatusCode.CREATED).json(result);
};

// Verify Email Controller
export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, { email_verify_token: string }>,
  res: Response,
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  if (!user) {
    return res.status(HttpStatusCode.NOT_FOUND).json({
      message: ValidationMessage.EMAIL_VERIFY_TOKEN_INVALID,
    });
  }
  if (user.email_verify_token === '') {
    return res.status(HttpStatusCode.OK).json({
      message: ValidationMessage.EMAIL_VERIFY_TOKEN_IS_VERIFIED,
    });
  }
  const result = await usersServices.verifyEmail(user_id);
  return res.status(HttpStatusCode.OK).json({
    message: 'Email verification successful',
    result,
  });
};

// Resend Verify Email Controller
export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  if (!user) {
    return res.status(HttpStatusCode.NOT_FOUND).json({
      message: ValidationMessage.USER_NOT_FOUND,
    });
  }
  if (user.verify === UserVerifyStatus.VERIFIED) {
    return res.status(HttpStatusCode.OK).json({
      message: ValidationMessage.EMAIL_VERIFY_TOKEN_IS_VERIFIED,
    });
  }
  const result = await usersServices.resendVerifyEmail(user_id);
  return res.status(HttpStatusCode.OK).json({
    message: 'Resend email verification successful',
    result,
  });
};

// Forgot Password Controller
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, { email: string }>,
  res: Response,
) => {
  const { email } = req.body;
  const result = await usersServices.forgotPassword(email);
  return res.status(HttpStatusCode.OK).json({
    result,
  });
};

// Verify Forgot Password Controller
export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, { forgot_password_token: string }>,
  res: Response,
) => {
  const result = await usersServices.verifyForgotPasswordToken(req.body.forgot_password_token);
  res.status(HttpStatusCode.OK).json({
    result,
  });
};

// Get me
export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const user = await usersServices.getMe(user_id);
  return res.json({
    message: ValidationMessage.SUCCESS,
    user,
  });
};
