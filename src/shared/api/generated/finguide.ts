import {
  apiBaseUrl
} from '../baseUrl';

import type {
  BadRequestResponse,
  BudgetSettings,
  Contribution,
  DeleteMeAvatar200,
  ExpenseItem,
  GetExportJobId200,
  GetMe200,
  GetNotificationsParams,
  GetPlansCurrent200,
  GetPlansPlanIdAnalyticsAssumptions200,
  GetPlansPlanIdAnalyticsBalanceCurrent200,
  GetPlansPlanIdAnalyticsCashflow200,
  GetPlansPlanIdAnalyticsCashflowParams,
  GetPlansPlanIdAnalyticsHealth200,
  GetPlansPlanIdAnalyticsProjection200,
  GetPlansPlanIdAnalyticsProjectionParams,
  GetPlansPlanIdBudget200,
  GetPlansPlanIdCalendarMonthlyTrackerParams,
  GetPlansPlanIdContributions200,
  GetPlansPlanIdContributionsId200,
  GetPlansPlanIdDashboard200,
  GetPlansPlanIdExpenses200,
  GetPlansPlanIdExpensesId200,
  GetPlansPlanIdGoals200,
  GetPlansPlanIdGoalsId200,
  GetPlansPlanIdIncomes200,
  GetPlansPlanIdIncomesId200,
  GetPlansPlanIdPension200,
  GetPlansPlanIdPensionProjection200,
  GetScenarios200,
  GetScenariosScenarioId200,
  Goal,
  ImportRequest,
  IncomeSource,
  LoginRequest,
  ModelAssumptions,
  NotFoundResponse,
  PatchMe200,
  PatchPlansPlanIdAnalyticsAssumptions200,
  PatchPlansPlanIdBudget200,
  PatchPlansPlanIdContributionsId200,
  PatchPlansPlanIdExpensesId200,
  PatchPlansPlanIdGoalsId200,
  PatchPlansPlanIdIncomesId200,
  PatchPlansPlanIdPension200,
  PatchScenariosScenarioId200,
  PensionSettings,
  PlanState,
  PostAuthLogin200,
  PostAuthPasswordForgotBody,
  PostAuthPasswordResetBody,
  PostAuthRefresh200,
  PostAuthRefreshBody,
  PostAuthRegister201,
  PostExport201,
  PostExportBody,
  PostImport200,
  PostImportBodyTwo,
  PostNotificationsReadBody,
  PostPlansPlanIdBudgetEnvelopesAutogenerate200,
  PostPlansPlanIdCalendarMonthlyTrackerBody,
  PostPlansPlanIdCalendarMonthlyTrackerParams,
  PostPlansPlanIdContributions201,
  PostPlansPlanIdExpenses201,
  PostPlansPlanIdGoals201,
  PostPlansPlanIdGoalsReorder200,
  PostPlansPlanIdGoalsReorderBody,
  PostPlansPlanIdIncomes201,
  PostScenarios201,
  PostScenariosCompareBody,
  PutMeAvatar200,
  PutMeAvatarBody,
  PutMePasswordBody,
  PutPlansCurrent200,
  RegisterRequest,
  Scenario,
  UnauthorizedResponse,
  UserProfile
} from './model';


/**
 * @summary Create account
 */
export type postAuthRegisterResponse201 = {
  data: PostAuthRegister201
  status: 201
}

export type postAuthRegisterResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postAuthRegisterResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postAuthRegisterResponseSuccess = (postAuthRegisterResponse201) & {
  headers: Headers;
};
export type postAuthRegisterResponseError = (postAuthRegisterResponse400 | postAuthRegisterResponse401) & {
  headers: Headers;
};

export type postAuthRegisterResponse = (postAuthRegisterResponseSuccess | postAuthRegisterResponseError)

export const getPostAuthRegisterUrl = () => {




  return `${apiBaseUrl}/auth/register`
}

export const postAuthRegister = async (registerRequest: RegisterRequest, options?: RequestInit): Promise<postAuthRegisterResponse> => {

  const res = await fetch(getPostAuthRegisterUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      registerRequest,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postAuthRegisterResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postAuthRegisterResponse
}



/**
 * @summary Login by email or phone
 */
export type postAuthLoginResponse200 = {
  data: PostAuthLogin200
  status: 200
}

export type postAuthLoginResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postAuthLoginResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postAuthLoginResponseSuccess = (postAuthLoginResponse200) & {
  headers: Headers;
};
export type postAuthLoginResponseError = (postAuthLoginResponse400 | postAuthLoginResponse401) & {
  headers: Headers;
};

export type postAuthLoginResponse = (postAuthLoginResponseSuccess | postAuthLoginResponseError)

export const getPostAuthLoginUrl = () => {




  return `${apiBaseUrl}/auth/login`
}

export const postAuthLogin = async (loginRequest: LoginRequest, options?: RequestInit): Promise<postAuthLoginResponse> => {

  const res = await fetch(getPostAuthLoginUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      loginRequest,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postAuthLoginResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postAuthLoginResponse
}



/**
 * @summary Refresh access token
 */
export type postAuthRefreshResponse200 = {
  data: PostAuthRefresh200
  status: 200
}

export type postAuthRefreshResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postAuthRefreshResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postAuthRefreshResponseSuccess = (postAuthRefreshResponse200) & {
  headers: Headers;
};
export type postAuthRefreshResponseError = (postAuthRefreshResponse400 | postAuthRefreshResponse401) & {
  headers: Headers;
};

export type postAuthRefreshResponse = (postAuthRefreshResponseSuccess | postAuthRefreshResponseError)

export const getPostAuthRefreshUrl = () => {




  return `${apiBaseUrl}/auth/refresh`
}

export const postAuthRefresh = async (postAuthRefreshBody: PostAuthRefreshBody, options?: RequestInit): Promise<postAuthRefreshResponse> => {

  const res = await fetch(getPostAuthRefreshUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postAuthRefreshBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postAuthRefreshResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postAuthRefreshResponse
}



/**
 * @summary Revoke current refresh token
 */
export type postAuthLogoutResponse204 = {
  data: void
  status: 204
}

export type postAuthLogoutResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postAuthLogoutResponseSuccess = (postAuthLogoutResponse204) & {
  headers: Headers;
};
export type postAuthLogoutResponseError = (postAuthLogoutResponse401) & {
  headers: Headers;
};

export type postAuthLogoutResponse = (postAuthLogoutResponseSuccess | postAuthLogoutResponseError)

export const getPostAuthLogoutUrl = () => {




  return `${apiBaseUrl}/auth/logout`
}

export const postAuthLogout = async ( options?: RequestInit): Promise<postAuthLogoutResponse> => {

  const res = await fetch(getPostAuthLogoutUrl(),
  {
    ...options,
    method: 'POST'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postAuthLogoutResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as postAuthLogoutResponse
}



/**
 * @summary Send password reset link
 */
export type postAuthPasswordForgotResponse202 = {
  data: void
  status: 202
}

export type postAuthPasswordForgotResponseSuccess = (postAuthPasswordForgotResponse202) & {
  headers: Headers;
};
;

export type postAuthPasswordForgotResponse = (postAuthPasswordForgotResponseSuccess)

export const getPostAuthPasswordForgotUrl = () => {




  return `${apiBaseUrl}/auth/password/forgot`
}

export const postAuthPasswordForgot = async (postAuthPasswordForgotBody: PostAuthPasswordForgotBody, options?: RequestInit): Promise<postAuthPasswordForgotResponse> => {

  const res = await fetch(getPostAuthPasswordForgotUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postAuthPasswordForgotBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postAuthPasswordForgotResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as postAuthPasswordForgotResponse
}



/**
 * @summary Reset password by token
 */
export type postAuthPasswordResetResponse204 = {
  data: void
  status: 204
}

export type postAuthPasswordResetResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postAuthPasswordResetResponseSuccess = (postAuthPasswordResetResponse204) & {
  headers: Headers;
};
export type postAuthPasswordResetResponseError = (postAuthPasswordResetResponse400) & {
  headers: Headers;
};

export type postAuthPasswordResetResponse = (postAuthPasswordResetResponseSuccess | postAuthPasswordResetResponseError)

export const getPostAuthPasswordResetUrl = () => {




  return `${apiBaseUrl}/auth/password/reset`
}

export const postAuthPasswordReset = async (postAuthPasswordResetBody: PostAuthPasswordResetBody, options?: RequestInit): Promise<postAuthPasswordResetResponse> => {

  const res = await fetch(getPostAuthPasswordResetUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postAuthPasswordResetBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postAuthPasswordResetResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as postAuthPasswordResetResponse
}



/**
 * @summary Current user profile
 */
export type getMeResponse200 = {
  data: GetMe200
  status: 200
}

export type getMeResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getMeResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getMeResponseSuccess = (getMeResponse200) & {
  headers: Headers;
};
export type getMeResponseError = (getMeResponse400 | getMeResponse401) & {
  headers: Headers;
};

export type getMeResponse = (getMeResponseSuccess | getMeResponseError)

export const getGetMeUrl = () => {




  return `${apiBaseUrl}/me`
}

export const getMe = async ( options?: RequestInit): Promise<getMeResponse> => {

  const res = await fetch(getGetMeUrl(),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getMeResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getMeResponse
}



/**
 * @summary Update profile fields
 */
export type patchMeResponse200 = {
  data: PatchMe200
  status: 200
}

export type patchMeResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchMeResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchMeResponseSuccess = (patchMeResponse200) & {
  headers: Headers;
};
export type patchMeResponseError = (patchMeResponse400 | patchMeResponse401) & {
  headers: Headers;
};

export type patchMeResponse = (patchMeResponseSuccess | patchMeResponseError)

export const getPatchMeUrl = () => {




  return `${apiBaseUrl}/me`
}

export const patchMe = async (userProfile: UserProfile, options?: RequestInit): Promise<patchMeResponse> => {

  const res = await fetch(getPatchMeUrl(),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      userProfile,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchMeResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchMeResponse
}



/**
 * @summary Upload avatar image
 */
export type putMeAvatarResponse200 = {
  data: PutMeAvatar200
  status: 200
}

export type putMeAvatarResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type putMeAvatarResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type putMeAvatarResponseSuccess = (putMeAvatarResponse200) & {
  headers: Headers;
};
export type putMeAvatarResponseError = (putMeAvatarResponse400 | putMeAvatarResponse401) & {
  headers: Headers;
};

export type putMeAvatarResponse = (putMeAvatarResponseSuccess | putMeAvatarResponseError)

export const getPutMeAvatarUrl = () => {




  return `${apiBaseUrl}/me/avatar`
}

export const putMeAvatar = async (putMeAvatarBody: PutMeAvatarBody, options?: RequestInit): Promise<putMeAvatarResponse> => {
    const formData = new FormData();
if(putMeAvatarBody.file !== undefined) {
 formData.append(`file`, putMeAvatarBody.file);
 }

  const res = await fetch(getPutMeAvatarUrl(),
  {
    ...options,
    method: 'PUT'
    ,
    body:
      formData,
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: putMeAvatarResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as putMeAvatarResponse
}



/**
 * @summary Remove avatar
 */
export type deleteMeAvatarResponse200 = {
  data: DeleteMeAvatar200
  status: 200
}

export type deleteMeAvatarResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type deleteMeAvatarResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type deleteMeAvatarResponseSuccess = (deleteMeAvatarResponse200) & {
  headers: Headers;
};
export type deleteMeAvatarResponseError = (deleteMeAvatarResponse400 | deleteMeAvatarResponse401) & {
  headers: Headers;
};

export type deleteMeAvatarResponse = (deleteMeAvatarResponseSuccess | deleteMeAvatarResponseError)

export const getDeleteMeAvatarUrl = () => {




  return `${apiBaseUrl}/me/avatar`
}

export const deleteMeAvatar = async ( options?: RequestInit): Promise<deleteMeAvatarResponse> => {

  const res = await fetch(getDeleteMeAvatarUrl(),
  {
    ...options,
    method: 'DELETE'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: deleteMeAvatarResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as deleteMeAvatarResponse
}



/**
 * @summary Change password
 */
export type putMePasswordResponse204 = {
  data: void
  status: 204
}

export type putMePasswordResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type putMePasswordResponseSuccess = (putMePasswordResponse204) & {
  headers: Headers;
};
export type putMePasswordResponseError = (putMePasswordResponse400) & {
  headers: Headers;
};

export type putMePasswordResponse = (putMePasswordResponseSuccess | putMePasswordResponseError)

export const getPutMePasswordUrl = () => {




  return `${apiBaseUrl}/me/password`
}

export const putMePassword = async (putMePasswordBody: PutMePasswordBody, options?: RequestInit): Promise<putMePasswordResponse> => {

  const res = await fetch(getPutMePasswordUrl(),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      putMePasswordBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: putMePasswordResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as putMePasswordResponse
}



/**
 * @summary Get full normalized current plan state
 */
export type getPlansCurrentResponse200 = {
  data: GetPlansCurrent200
  status: 200
}

export type getPlansCurrentResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansCurrentResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansCurrentResponseSuccess = (getPlansCurrentResponse200) & {
  headers: Headers;
};
export type getPlansCurrentResponseError = (getPlansCurrentResponse400 | getPlansCurrentResponse401) & {
  headers: Headers;
};

export type getPlansCurrentResponse = (getPlansCurrentResponseSuccess | getPlansCurrentResponseError)

export const getGetPlansCurrentUrl = () => {




  return `${apiBaseUrl}/plans/current`
}

export const getPlansCurrent = async ( options?: RequestInit): Promise<getPlansCurrentResponse> => {

  const res = await fetch(getGetPlansCurrentUrl(),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansCurrentResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansCurrentResponse
}



/**
 * @summary Replace current plan state, used for migration/import
 */
export type putPlansCurrentResponse200 = {
  data: PutPlansCurrent200
  status: 200
}

export type putPlansCurrentResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type putPlansCurrentResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type putPlansCurrentResponseSuccess = (putPlansCurrentResponse200) & {
  headers: Headers;
};
export type putPlansCurrentResponseError = (putPlansCurrentResponse400 | putPlansCurrentResponse401) & {
  headers: Headers;
};

export type putPlansCurrentResponse = (putPlansCurrentResponseSuccess | putPlansCurrentResponseError)

export const getPutPlansCurrentUrl = () => {




  return `${apiBaseUrl}/plans/current`
}

export const putPlansCurrent = async (planState: PlanState, options?: RequestInit): Promise<putPlansCurrentResponse> => {

  const res = await fetch(getPutPlansCurrentUrl(),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      planState,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: putPlansCurrentResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as putPlansCurrentResponse
}



/**
 * @summary List incomes
 */
export type getPlansPlanIdIncomesResponse200 = {
  data: GetPlansPlanIdIncomes200
  status: 200
}

export type getPlansPlanIdIncomesResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdIncomesResponseSuccess = (getPlansPlanIdIncomesResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdIncomesResponseError = (getPlansPlanIdIncomesResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdIncomesResponse = (getPlansPlanIdIncomesResponseSuccess | getPlansPlanIdIncomesResponseError)

export const getGetPlansPlanIdIncomesUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/incomes`
}

export const getPlansPlanIdIncomes = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdIncomesResponse> => {

  const res = await fetch(getGetPlansPlanIdIncomesUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdIncomesResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdIncomesResponse
}



/**
 * @summary Create income
 */
export type postPlansPlanIdIncomesResponse201 = {
  data: PostPlansPlanIdIncomes201
  status: 201
}

export type postPlansPlanIdIncomesResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postPlansPlanIdIncomesResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postPlansPlanIdIncomesResponseSuccess = (postPlansPlanIdIncomesResponse201) & {
  headers: Headers;
};
export type postPlansPlanIdIncomesResponseError = (postPlansPlanIdIncomesResponse400 | postPlansPlanIdIncomesResponse401) & {
  headers: Headers;
};

export type postPlansPlanIdIncomesResponse = (postPlansPlanIdIncomesResponseSuccess | postPlansPlanIdIncomesResponseError)

export const getPostPlansPlanIdIncomesUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/incomes`
}

export const postPlansPlanIdIncomes = async (planId: string,
    incomeSource: IncomeSource, options?: RequestInit): Promise<postPlansPlanIdIncomesResponse> => {

  const res = await fetch(getPostPlansPlanIdIncomesUrl(planId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      incomeSource,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postPlansPlanIdIncomesResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postPlansPlanIdIncomesResponse
}



/**
 * @summary Get income
 */
export type getPlansPlanIdIncomesIdResponse200 = {
  data: GetPlansPlanIdIncomesId200
  status: 200
}

export type getPlansPlanIdIncomesIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdIncomesIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdIncomesIdResponseSuccess = (getPlansPlanIdIncomesIdResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdIncomesIdResponseError = (getPlansPlanIdIncomesIdResponse400 | getPlansPlanIdIncomesIdResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdIncomesIdResponse = (getPlansPlanIdIncomesIdResponseSuccess | getPlansPlanIdIncomesIdResponseError)

export const getGetPlansPlanIdIncomesIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/incomes/${id}`
}

export const getPlansPlanIdIncomesId = async (planId: string,
    id: string, options?: RequestInit): Promise<getPlansPlanIdIncomesIdResponse> => {

  const res = await fetch(getGetPlansPlanIdIncomesIdUrl(planId,id),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdIncomesIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdIncomesIdResponse
}



/**
 * @summary Patch income
 */
export type patchPlansPlanIdIncomesIdResponse200 = {
  data: PatchPlansPlanIdIncomesId200
  status: 200
}

export type patchPlansPlanIdIncomesIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchPlansPlanIdIncomesIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchPlansPlanIdIncomesIdResponseSuccess = (patchPlansPlanIdIncomesIdResponse200) & {
  headers: Headers;
};
export type patchPlansPlanIdIncomesIdResponseError = (patchPlansPlanIdIncomesIdResponse400 | patchPlansPlanIdIncomesIdResponse401) & {
  headers: Headers;
};

export type patchPlansPlanIdIncomesIdResponse = (patchPlansPlanIdIncomesIdResponseSuccess | patchPlansPlanIdIncomesIdResponseError)

export const getPatchPlansPlanIdIncomesIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/incomes/${id}`
}

export const patchPlansPlanIdIncomesId = async (planId: string,
    id: string,
    incomeSource: IncomeSource, options?: RequestInit): Promise<patchPlansPlanIdIncomesIdResponse> => {

  const res = await fetch(getPatchPlansPlanIdIncomesIdUrl(planId,id),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      incomeSource,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchPlansPlanIdIncomesIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchPlansPlanIdIncomesIdResponse
}



/**
 * @summary Delete income
 */
export type deletePlansPlanIdIncomesIdResponse204 = {
  data: void
  status: 204
}

export type deletePlansPlanIdIncomesIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type deletePlansPlanIdIncomesIdResponse404 = {
  data: NotFoundResponse
  status: 404
}

export type deletePlansPlanIdIncomesIdResponseSuccess = (deletePlansPlanIdIncomesIdResponse204) & {
  headers: Headers;
};
export type deletePlansPlanIdIncomesIdResponseError = (deletePlansPlanIdIncomesIdResponse401 | deletePlansPlanIdIncomesIdResponse404) & {
  headers: Headers;
};

export type deletePlansPlanIdIncomesIdResponse = (deletePlansPlanIdIncomesIdResponseSuccess | deletePlansPlanIdIncomesIdResponseError)

export const getDeletePlansPlanIdIncomesIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/incomes/${id}`
}

export const deletePlansPlanIdIncomesId = async (planId: string,
    id: string, options?: RequestInit): Promise<deletePlansPlanIdIncomesIdResponse> => {

  const res = await fetch(getDeletePlansPlanIdIncomesIdUrl(planId,id),
  {
    ...options,
    method: 'DELETE'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: deletePlansPlanIdIncomesIdResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as deletePlansPlanIdIncomesIdResponse
}



/**
 * @summary List expenses
 */
export type getPlansPlanIdExpensesResponse200 = {
  data: GetPlansPlanIdExpenses200
  status: 200
}

export type getPlansPlanIdExpensesResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdExpensesResponseSuccess = (getPlansPlanIdExpensesResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdExpensesResponseError = (getPlansPlanIdExpensesResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdExpensesResponse = (getPlansPlanIdExpensesResponseSuccess | getPlansPlanIdExpensesResponseError)

export const getGetPlansPlanIdExpensesUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/expenses`
}

export const getPlansPlanIdExpenses = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdExpensesResponse> => {

  const res = await fetch(getGetPlansPlanIdExpensesUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdExpensesResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdExpensesResponse
}



/**
 * @summary Create expense
 */
export type postPlansPlanIdExpensesResponse201 = {
  data: PostPlansPlanIdExpenses201
  status: 201
}

export type postPlansPlanIdExpensesResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postPlansPlanIdExpensesResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postPlansPlanIdExpensesResponseSuccess = (postPlansPlanIdExpensesResponse201) & {
  headers: Headers;
};
export type postPlansPlanIdExpensesResponseError = (postPlansPlanIdExpensesResponse400 | postPlansPlanIdExpensesResponse401) & {
  headers: Headers;
};

export type postPlansPlanIdExpensesResponse = (postPlansPlanIdExpensesResponseSuccess | postPlansPlanIdExpensesResponseError)

export const getPostPlansPlanIdExpensesUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/expenses`
}

export const postPlansPlanIdExpenses = async (planId: string,
    expenseItem: ExpenseItem, options?: RequestInit): Promise<postPlansPlanIdExpensesResponse> => {

  const res = await fetch(getPostPlansPlanIdExpensesUrl(planId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      expenseItem,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postPlansPlanIdExpensesResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postPlansPlanIdExpensesResponse
}



/**
 * @summary Get expense
 */
export type getPlansPlanIdExpensesIdResponse200 = {
  data: GetPlansPlanIdExpensesId200
  status: 200
}

export type getPlansPlanIdExpensesIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdExpensesIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdExpensesIdResponseSuccess = (getPlansPlanIdExpensesIdResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdExpensesIdResponseError = (getPlansPlanIdExpensesIdResponse400 | getPlansPlanIdExpensesIdResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdExpensesIdResponse = (getPlansPlanIdExpensesIdResponseSuccess | getPlansPlanIdExpensesIdResponseError)

export const getGetPlansPlanIdExpensesIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/expenses/${id}`
}

export const getPlansPlanIdExpensesId = async (planId: string,
    id: string, options?: RequestInit): Promise<getPlansPlanIdExpensesIdResponse> => {

  const res = await fetch(getGetPlansPlanIdExpensesIdUrl(planId,id),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdExpensesIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdExpensesIdResponse
}



/**
 * @summary Patch expense
 */
export type patchPlansPlanIdExpensesIdResponse200 = {
  data: PatchPlansPlanIdExpensesId200
  status: 200
}

export type patchPlansPlanIdExpensesIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchPlansPlanIdExpensesIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchPlansPlanIdExpensesIdResponseSuccess = (patchPlansPlanIdExpensesIdResponse200) & {
  headers: Headers;
};
export type patchPlansPlanIdExpensesIdResponseError = (patchPlansPlanIdExpensesIdResponse400 | patchPlansPlanIdExpensesIdResponse401) & {
  headers: Headers;
};

export type patchPlansPlanIdExpensesIdResponse = (patchPlansPlanIdExpensesIdResponseSuccess | patchPlansPlanIdExpensesIdResponseError)

export const getPatchPlansPlanIdExpensesIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/expenses/${id}`
}

export const patchPlansPlanIdExpensesId = async (planId: string,
    id: string,
    expenseItem: ExpenseItem, options?: RequestInit): Promise<patchPlansPlanIdExpensesIdResponse> => {

  const res = await fetch(getPatchPlansPlanIdExpensesIdUrl(planId,id),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      expenseItem,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchPlansPlanIdExpensesIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchPlansPlanIdExpensesIdResponse
}



/**
 * @summary Delete expense
 */
export type deletePlansPlanIdExpensesIdResponse204 = {
  data: void
  status: 204
}

export type deletePlansPlanIdExpensesIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type deletePlansPlanIdExpensesIdResponse404 = {
  data: NotFoundResponse
  status: 404
}

export type deletePlansPlanIdExpensesIdResponseSuccess = (deletePlansPlanIdExpensesIdResponse204) & {
  headers: Headers;
};
export type deletePlansPlanIdExpensesIdResponseError = (deletePlansPlanIdExpensesIdResponse401 | deletePlansPlanIdExpensesIdResponse404) & {
  headers: Headers;
};

export type deletePlansPlanIdExpensesIdResponse = (deletePlansPlanIdExpensesIdResponseSuccess | deletePlansPlanIdExpensesIdResponseError)

export const getDeletePlansPlanIdExpensesIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/expenses/${id}`
}

export const deletePlansPlanIdExpensesId = async (planId: string,
    id: string, options?: RequestInit): Promise<deletePlansPlanIdExpensesIdResponse> => {

  const res = await fetch(getDeletePlansPlanIdExpensesIdUrl(planId,id),
  {
    ...options,
    method: 'DELETE'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: deletePlansPlanIdExpensesIdResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as deletePlansPlanIdExpensesIdResponse
}



/**
 * @summary List goals
 */
export type getPlansPlanIdGoalsResponse200 = {
  data: GetPlansPlanIdGoals200
  status: 200
}

export type getPlansPlanIdGoalsResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdGoalsResponseSuccess = (getPlansPlanIdGoalsResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdGoalsResponseError = (getPlansPlanIdGoalsResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdGoalsResponse = (getPlansPlanIdGoalsResponseSuccess | getPlansPlanIdGoalsResponseError)

export const getGetPlansPlanIdGoalsUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/goals`
}

export const getPlansPlanIdGoals = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdGoalsResponse> => {

  const res = await fetch(getGetPlansPlanIdGoalsUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdGoalsResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdGoalsResponse
}



/**
 * @summary Create goal
 */
export type postPlansPlanIdGoalsResponse201 = {
  data: PostPlansPlanIdGoals201
  status: 201
}

export type postPlansPlanIdGoalsResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postPlansPlanIdGoalsResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postPlansPlanIdGoalsResponseSuccess = (postPlansPlanIdGoalsResponse201) & {
  headers: Headers;
};
export type postPlansPlanIdGoalsResponseError = (postPlansPlanIdGoalsResponse400 | postPlansPlanIdGoalsResponse401) & {
  headers: Headers;
};

export type postPlansPlanIdGoalsResponse = (postPlansPlanIdGoalsResponseSuccess | postPlansPlanIdGoalsResponseError)

export const getPostPlansPlanIdGoalsUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/goals`
}

export const postPlansPlanIdGoals = async (planId: string,
    goal: Goal, options?: RequestInit): Promise<postPlansPlanIdGoalsResponse> => {

  const res = await fetch(getPostPlansPlanIdGoalsUrl(planId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      goal,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postPlansPlanIdGoalsResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postPlansPlanIdGoalsResponse
}



/**
 * @summary Get goal
 */
export type getPlansPlanIdGoalsIdResponse200 = {
  data: GetPlansPlanIdGoalsId200
  status: 200
}

export type getPlansPlanIdGoalsIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdGoalsIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdGoalsIdResponseSuccess = (getPlansPlanIdGoalsIdResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdGoalsIdResponseError = (getPlansPlanIdGoalsIdResponse400 | getPlansPlanIdGoalsIdResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdGoalsIdResponse = (getPlansPlanIdGoalsIdResponseSuccess | getPlansPlanIdGoalsIdResponseError)

export const getGetPlansPlanIdGoalsIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/goals/${id}`
}

export const getPlansPlanIdGoalsId = async (planId: string,
    id: string, options?: RequestInit): Promise<getPlansPlanIdGoalsIdResponse> => {

  const res = await fetch(getGetPlansPlanIdGoalsIdUrl(planId,id),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdGoalsIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdGoalsIdResponse
}



/**
 * @summary Patch goal
 */
export type patchPlansPlanIdGoalsIdResponse200 = {
  data: PatchPlansPlanIdGoalsId200
  status: 200
}

export type patchPlansPlanIdGoalsIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchPlansPlanIdGoalsIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchPlansPlanIdGoalsIdResponseSuccess = (patchPlansPlanIdGoalsIdResponse200) & {
  headers: Headers;
};
export type patchPlansPlanIdGoalsIdResponseError = (patchPlansPlanIdGoalsIdResponse400 | patchPlansPlanIdGoalsIdResponse401) & {
  headers: Headers;
};

export type patchPlansPlanIdGoalsIdResponse = (patchPlansPlanIdGoalsIdResponseSuccess | patchPlansPlanIdGoalsIdResponseError)

export const getPatchPlansPlanIdGoalsIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/goals/${id}`
}

export const patchPlansPlanIdGoalsId = async (planId: string,
    id: string,
    goal: Goal, options?: RequestInit): Promise<patchPlansPlanIdGoalsIdResponse> => {

  const res = await fetch(getPatchPlansPlanIdGoalsIdUrl(planId,id),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      goal,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchPlansPlanIdGoalsIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchPlansPlanIdGoalsIdResponse
}



/**
 * @summary Delete goal
 */
export type deletePlansPlanIdGoalsIdResponse204 = {
  data: void
  status: 204
}

export type deletePlansPlanIdGoalsIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type deletePlansPlanIdGoalsIdResponse404 = {
  data: NotFoundResponse
  status: 404
}

export type deletePlansPlanIdGoalsIdResponseSuccess = (deletePlansPlanIdGoalsIdResponse204) & {
  headers: Headers;
};
export type deletePlansPlanIdGoalsIdResponseError = (deletePlansPlanIdGoalsIdResponse401 | deletePlansPlanIdGoalsIdResponse404) & {
  headers: Headers;
};

export type deletePlansPlanIdGoalsIdResponse = (deletePlansPlanIdGoalsIdResponseSuccess | deletePlansPlanIdGoalsIdResponseError)

export const getDeletePlansPlanIdGoalsIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/goals/${id}`
}

export const deletePlansPlanIdGoalsId = async (planId: string,
    id: string, options?: RequestInit): Promise<deletePlansPlanIdGoalsIdResponse> => {

  const res = await fetch(getDeletePlansPlanIdGoalsIdUrl(planId,id),
  {
    ...options,
    method: 'DELETE'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: deletePlansPlanIdGoalsIdResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as deletePlansPlanIdGoalsIdResponse
}



/**
 * @summary List contributions
 */
export type getPlansPlanIdContributionsResponse200 = {
  data: GetPlansPlanIdContributions200
  status: 200
}

export type getPlansPlanIdContributionsResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdContributionsResponseSuccess = (getPlansPlanIdContributionsResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdContributionsResponseError = (getPlansPlanIdContributionsResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdContributionsResponse = (getPlansPlanIdContributionsResponseSuccess | getPlansPlanIdContributionsResponseError)

export const getGetPlansPlanIdContributionsUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/contributions`
}

export const getPlansPlanIdContributions = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdContributionsResponse> => {

  const res = await fetch(getGetPlansPlanIdContributionsUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdContributionsResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdContributionsResponse
}



/**
 * @summary Create contribution
 */
export type postPlansPlanIdContributionsResponse201 = {
  data: PostPlansPlanIdContributions201
  status: 201
}

export type postPlansPlanIdContributionsResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postPlansPlanIdContributionsResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postPlansPlanIdContributionsResponseSuccess = (postPlansPlanIdContributionsResponse201) & {
  headers: Headers;
};
export type postPlansPlanIdContributionsResponseError = (postPlansPlanIdContributionsResponse400 | postPlansPlanIdContributionsResponse401) & {
  headers: Headers;
};

export type postPlansPlanIdContributionsResponse = (postPlansPlanIdContributionsResponseSuccess | postPlansPlanIdContributionsResponseError)

export const getPostPlansPlanIdContributionsUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/contributions`
}

export const postPlansPlanIdContributions = async (planId: string,
    contribution: Contribution, options?: RequestInit): Promise<postPlansPlanIdContributionsResponse> => {

  const res = await fetch(getPostPlansPlanIdContributionsUrl(planId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      contribution,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postPlansPlanIdContributionsResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postPlansPlanIdContributionsResponse
}



/**
 * @summary Get contribution
 */
export type getPlansPlanIdContributionsIdResponse200 = {
  data: GetPlansPlanIdContributionsId200
  status: 200
}

export type getPlansPlanIdContributionsIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdContributionsIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdContributionsIdResponseSuccess = (getPlansPlanIdContributionsIdResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdContributionsIdResponseError = (getPlansPlanIdContributionsIdResponse400 | getPlansPlanIdContributionsIdResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdContributionsIdResponse = (getPlansPlanIdContributionsIdResponseSuccess | getPlansPlanIdContributionsIdResponseError)

export const getGetPlansPlanIdContributionsIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/contributions/${id}`
}

export const getPlansPlanIdContributionsId = async (planId: string,
    id: string, options?: RequestInit): Promise<getPlansPlanIdContributionsIdResponse> => {

  const res = await fetch(getGetPlansPlanIdContributionsIdUrl(planId,id),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdContributionsIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdContributionsIdResponse
}



/**
 * @summary Patch contribution
 */
export type patchPlansPlanIdContributionsIdResponse200 = {
  data: PatchPlansPlanIdContributionsId200
  status: 200
}

export type patchPlansPlanIdContributionsIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchPlansPlanIdContributionsIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchPlansPlanIdContributionsIdResponseSuccess = (patchPlansPlanIdContributionsIdResponse200) & {
  headers: Headers;
};
export type patchPlansPlanIdContributionsIdResponseError = (patchPlansPlanIdContributionsIdResponse400 | patchPlansPlanIdContributionsIdResponse401) & {
  headers: Headers;
};

export type patchPlansPlanIdContributionsIdResponse = (patchPlansPlanIdContributionsIdResponseSuccess | patchPlansPlanIdContributionsIdResponseError)

export const getPatchPlansPlanIdContributionsIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/contributions/${id}`
}

export const patchPlansPlanIdContributionsId = async (planId: string,
    id: string,
    contribution: Contribution, options?: RequestInit): Promise<patchPlansPlanIdContributionsIdResponse> => {

  const res = await fetch(getPatchPlansPlanIdContributionsIdUrl(planId,id),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      contribution,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchPlansPlanIdContributionsIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchPlansPlanIdContributionsIdResponse
}



/**
 * @summary Delete contribution
 */
export type deletePlansPlanIdContributionsIdResponse204 = {
  data: void
  status: 204
}

export type deletePlansPlanIdContributionsIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type deletePlansPlanIdContributionsIdResponse404 = {
  data: NotFoundResponse
  status: 404
}

export type deletePlansPlanIdContributionsIdResponseSuccess = (deletePlansPlanIdContributionsIdResponse204) & {
  headers: Headers;
};
export type deletePlansPlanIdContributionsIdResponseError = (deletePlansPlanIdContributionsIdResponse401 | deletePlansPlanIdContributionsIdResponse404) & {
  headers: Headers;
};

export type deletePlansPlanIdContributionsIdResponse = (deletePlansPlanIdContributionsIdResponseSuccess | deletePlansPlanIdContributionsIdResponseError)

export const getDeletePlansPlanIdContributionsIdUrl = (planId: string,
    id: string,) => {




  return `${apiBaseUrl}/plans/${planId}/contributions/${id}`
}

export const deletePlansPlanIdContributionsId = async (planId: string,
    id: string, options?: RequestInit): Promise<deletePlansPlanIdContributionsIdResponse> => {

  const res = await fetch(getDeletePlansPlanIdContributionsIdUrl(planId,id),
  {
    ...options,
    method: 'DELETE'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: deletePlansPlanIdContributionsIdResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as deletePlansPlanIdContributionsIdResponse
}



/**
 * @summary Persist goal order / waterfall priority
 */
export type postPlansPlanIdGoalsReorderResponse200 = {
  data: PostPlansPlanIdGoalsReorder200
  status: 200
}

export type postPlansPlanIdGoalsReorderResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postPlansPlanIdGoalsReorderResponseSuccess = (postPlansPlanIdGoalsReorderResponse200) & {
  headers: Headers;
};
export type postPlansPlanIdGoalsReorderResponseError = (postPlansPlanIdGoalsReorderResponse401) & {
  headers: Headers;
};

export type postPlansPlanIdGoalsReorderResponse = (postPlansPlanIdGoalsReorderResponseSuccess | postPlansPlanIdGoalsReorderResponseError)

export const getPostPlansPlanIdGoalsReorderUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/goals/reorder`
}

export const postPlansPlanIdGoalsReorder = async (planId: string,
    postPlansPlanIdGoalsReorderBody: PostPlansPlanIdGoalsReorderBody, options?: RequestInit): Promise<postPlansPlanIdGoalsReorderResponse> => {

  const res = await fetch(getPostPlansPlanIdGoalsReorderUrl(planId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postPlansPlanIdGoalsReorderBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postPlansPlanIdGoalsReorderResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postPlansPlanIdGoalsReorderResponse
}



/**
 * @summary Get pension settings
 */
export type getPlansPlanIdPensionResponse200 = {
  data: GetPlansPlanIdPension200
  status: 200
}

export type getPlansPlanIdPensionResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdPensionResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdPensionResponseSuccess = (getPlansPlanIdPensionResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdPensionResponseError = (getPlansPlanIdPensionResponse400 | getPlansPlanIdPensionResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdPensionResponse = (getPlansPlanIdPensionResponseSuccess | getPlansPlanIdPensionResponseError)

export const getGetPlansPlanIdPensionUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/pension`
}

export const getPlansPlanIdPension = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdPensionResponse> => {

  const res = await fetch(getGetPlansPlanIdPensionUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdPensionResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdPensionResponse
}



/**
 * @summary Update pension settings
 */
export type patchPlansPlanIdPensionResponse200 = {
  data: PatchPlansPlanIdPension200
  status: 200
}

export type patchPlansPlanIdPensionResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchPlansPlanIdPensionResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchPlansPlanIdPensionResponseSuccess = (patchPlansPlanIdPensionResponse200) & {
  headers: Headers;
};
export type patchPlansPlanIdPensionResponseError = (patchPlansPlanIdPensionResponse400 | patchPlansPlanIdPensionResponse401) & {
  headers: Headers;
};

export type patchPlansPlanIdPensionResponse = (patchPlansPlanIdPensionResponseSuccess | patchPlansPlanIdPensionResponseError)

export const getPatchPlansPlanIdPensionUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/pension`
}

export const patchPlansPlanIdPension = async (planId: string,
    pensionSettings: PensionSettings, options?: RequestInit): Promise<patchPlansPlanIdPensionResponse> => {

  const res = await fetch(getPatchPlansPlanIdPensionUrl(planId),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      pensionSettings,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchPlansPlanIdPensionResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchPlansPlanIdPensionResponse
}



/**
 * @summary Get budget method, envelopes and computed spending
 */
export type getPlansPlanIdBudgetResponse200 = {
  data: GetPlansPlanIdBudget200
  status: 200
}

export type getPlansPlanIdBudgetResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdBudgetResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdBudgetResponseSuccess = (getPlansPlanIdBudgetResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdBudgetResponseError = (getPlansPlanIdBudgetResponse400 | getPlansPlanIdBudgetResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdBudgetResponse = (getPlansPlanIdBudgetResponseSuccess | getPlansPlanIdBudgetResponseError)

export const getGetPlansPlanIdBudgetUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/budget`
}

export const getPlansPlanIdBudget = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdBudgetResponse> => {

  const res = await fetch(getGetPlansPlanIdBudgetUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdBudgetResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdBudgetResponse
}



/**
 * @summary Update budget method/classifications/envelopes
 */
export type patchPlansPlanIdBudgetResponse200 = {
  data: PatchPlansPlanIdBudget200
  status: 200
}

export type patchPlansPlanIdBudgetResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchPlansPlanIdBudgetResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchPlansPlanIdBudgetResponseSuccess = (patchPlansPlanIdBudgetResponse200) & {
  headers: Headers;
};
export type patchPlansPlanIdBudgetResponseError = (patchPlansPlanIdBudgetResponse400 | patchPlansPlanIdBudgetResponse401) & {
  headers: Headers;
};

export type patchPlansPlanIdBudgetResponse = (patchPlansPlanIdBudgetResponseSuccess | patchPlansPlanIdBudgetResponseError)

export const getPatchPlansPlanIdBudgetUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/budget`
}

export const patchPlansPlanIdBudget = async (planId: string,
    budgetSettings: BudgetSettings, options?: RequestInit): Promise<patchPlansPlanIdBudgetResponse> => {

  const res = await fetch(getPatchPlansPlanIdBudgetUrl(planId),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      budgetSettings,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchPlansPlanIdBudgetResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchPlansPlanIdBudgetResponse
}



/**
 * @summary Generate envelopes from current expenses with buffer
 */
export type postPlansPlanIdBudgetEnvelopesAutogenerateResponse200 = {
  data: PostPlansPlanIdBudgetEnvelopesAutogenerate200
  status: 200
}

export type postPlansPlanIdBudgetEnvelopesAutogenerateResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postPlansPlanIdBudgetEnvelopesAutogenerateResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postPlansPlanIdBudgetEnvelopesAutogenerateResponseSuccess = (postPlansPlanIdBudgetEnvelopesAutogenerateResponse200) & {
  headers: Headers;
};
export type postPlansPlanIdBudgetEnvelopesAutogenerateResponseError = (postPlansPlanIdBudgetEnvelopesAutogenerateResponse400 | postPlansPlanIdBudgetEnvelopesAutogenerateResponse401) & {
  headers: Headers;
};

export type postPlansPlanIdBudgetEnvelopesAutogenerateResponse = (postPlansPlanIdBudgetEnvelopesAutogenerateResponseSuccess | postPlansPlanIdBudgetEnvelopesAutogenerateResponseError)

export const getPostPlansPlanIdBudgetEnvelopesAutogenerateUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/budget/envelopes/autogenerate`
}

export const postPlansPlanIdBudgetEnvelopesAutogenerate = async (planId: string, options?: RequestInit): Promise<postPlansPlanIdBudgetEnvelopesAutogenerateResponse> => {

  const res = await fetch(getPostPlansPlanIdBudgetEnvelopesAutogenerateUrl(planId),
  {
    ...options,
    method: 'POST'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postPlansPlanIdBudgetEnvelopesAutogenerateResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postPlansPlanIdBudgetEnvelopesAutogenerateResponse
}



/**
 * @summary Dashboard metrics matching mockup cards
 */
export type getPlansPlanIdDashboardResponse200 = {
  data: GetPlansPlanIdDashboard200
  status: 200
}

export type getPlansPlanIdDashboardResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdDashboardResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdDashboardResponseSuccess = (getPlansPlanIdDashboardResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdDashboardResponseError = (getPlansPlanIdDashboardResponse400 | getPlansPlanIdDashboardResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdDashboardResponse = (getPlansPlanIdDashboardResponseSuccess | getPlansPlanIdDashboardResponseError)

export const getGetPlansPlanIdDashboardUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/dashboard`
}

export const getPlansPlanIdDashboard = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdDashboardResponse> => {

  const res = await fetch(getGetPlansPlanIdDashboardUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdDashboardResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdDashboardResponse
}



/**
 * @summary Financial health score and recommendations
 */
export type getPlansPlanIdAnalyticsHealthResponse200 = {
  data: GetPlansPlanIdAnalyticsHealth200
  status: 200
}

export type getPlansPlanIdAnalyticsHealthResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdAnalyticsHealthResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdAnalyticsHealthResponseSuccess = (getPlansPlanIdAnalyticsHealthResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdAnalyticsHealthResponseError = (getPlansPlanIdAnalyticsHealthResponse400 | getPlansPlanIdAnalyticsHealthResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdAnalyticsHealthResponse = (getPlansPlanIdAnalyticsHealthResponseSuccess | getPlansPlanIdAnalyticsHealthResponseError)

export const getGetPlansPlanIdAnalyticsHealthUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/analytics/health`
}

export const getPlansPlanIdAnalyticsHealth = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdAnalyticsHealthResponse> => {

  const res = await fetch(getGetPlansPlanIdAnalyticsHealthUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdAnalyticsHealthResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdAnalyticsHealthResponse
}



/**
 * @summary Long-term financial projection
 */
export type getPlansPlanIdAnalyticsProjectionResponse200 = {
  data: GetPlansPlanIdAnalyticsProjection200
  status: 200
}

export type getPlansPlanIdAnalyticsProjectionResponseSuccess = (getPlansPlanIdAnalyticsProjectionResponse200) & {
  headers: Headers;
};
;

export type getPlansPlanIdAnalyticsProjectionResponse = (getPlansPlanIdAnalyticsProjectionResponseSuccess)

export const getGetPlansPlanIdAnalyticsProjectionUrl = (planId: string,
    params?: GetPlansPlanIdAnalyticsProjectionParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      normalizedParams.append(key, String(value));
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `${apiBaseUrl}/plans/${planId}/analytics/projection?${stringifiedParams}` : `${apiBaseUrl}/plans/${planId}/analytics/projection`
}

export const getPlansPlanIdAnalyticsProjection = async (planId: string,
    params?: GetPlansPlanIdAnalyticsProjectionParams, options?: RequestInit): Promise<getPlansPlanIdAnalyticsProjectionResponse> => {

  const res = await fetch(getGetPlansPlanIdAnalyticsProjectionUrl(planId,params),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdAnalyticsProjectionResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdAnalyticsProjectionResponse
}



/**
 * @summary Monthly tracker: done/partial/missed savings months
 */
export type getPlansPlanIdCalendarMonthlyTrackerResponse200 = {
  data: void
  status: 200
}

export type getPlansPlanIdCalendarMonthlyTrackerResponseSuccess = (getPlansPlanIdCalendarMonthlyTrackerResponse200) & {
  headers: Headers;
};
;

export type getPlansPlanIdCalendarMonthlyTrackerResponse = (getPlansPlanIdCalendarMonthlyTrackerResponseSuccess)

export const getGetPlansPlanIdCalendarMonthlyTrackerUrl = (planId: string,
    params?: GetPlansPlanIdCalendarMonthlyTrackerParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      normalizedParams.append(key, String(value));
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `${apiBaseUrl}/plans/${planId}/calendar/monthly-tracker?${stringifiedParams}` : `${apiBaseUrl}/plans/${planId}/calendar/monthly-tracker`
}

export const getPlansPlanIdCalendarMonthlyTracker = async (planId: string,
    params?: GetPlansPlanIdCalendarMonthlyTrackerParams, options?: RequestInit): Promise<getPlansPlanIdCalendarMonthlyTrackerResponse> => {

  const res = await fetch(getGetPlansPlanIdCalendarMonthlyTrackerUrl(planId,params),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdCalendarMonthlyTrackerResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdCalendarMonthlyTrackerResponse
}



/**
 * @summary Mark month status
 */
export type postPlansPlanIdCalendarMonthlyTrackerResponse204 = {
  data: void
  status: 204
}

export type postPlansPlanIdCalendarMonthlyTrackerResponseSuccess = (postPlansPlanIdCalendarMonthlyTrackerResponse204) & {
  headers: Headers;
};
;

export type postPlansPlanIdCalendarMonthlyTrackerResponse = (postPlansPlanIdCalendarMonthlyTrackerResponseSuccess)

export const getPostPlansPlanIdCalendarMonthlyTrackerUrl = (planId: string,
    params?: PostPlansPlanIdCalendarMonthlyTrackerParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      normalizedParams.append(key, String(value));
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `${apiBaseUrl}/plans/${planId}/calendar/monthly-tracker?${stringifiedParams}` : `${apiBaseUrl}/plans/${planId}/calendar/monthly-tracker`
}

export const postPlansPlanIdCalendarMonthlyTracker = async (planId: string,
    postPlansPlanIdCalendarMonthlyTrackerBody: PostPlansPlanIdCalendarMonthlyTrackerBody,
    params?: PostPlansPlanIdCalendarMonthlyTrackerParams, options?: RequestInit): Promise<postPlansPlanIdCalendarMonthlyTrackerResponse> => {

  const res = await fetch(getPostPlansPlanIdCalendarMonthlyTrackerUrl(planId,params),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postPlansPlanIdCalendarMonthlyTrackerBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postPlansPlanIdCalendarMonthlyTrackerResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as postPlansPlanIdCalendarMonthlyTrackerResponse
}



/**
 * @summary List user scenarios
 */
export type getScenariosResponse200 = {
  data: GetScenarios200
  status: 200
}

export type getScenariosResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getScenariosResponseSuccess = (getScenariosResponse200) & {
  headers: Headers;
};
export type getScenariosResponseError = (getScenariosResponse401) & {
  headers: Headers;
};

export type getScenariosResponse = (getScenariosResponseSuccess | getScenariosResponseError)

export const getGetScenariosUrl = () => {




  return `${apiBaseUrl}/scenarios`
}

export const getScenarios = async ( options?: RequestInit): Promise<getScenariosResponse> => {

  const res = await fetch(getGetScenariosUrl(),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getScenariosResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getScenariosResponse
}



/**
 * @summary Create scenario from blank plan, clone or adjustments
 */
export type postScenariosResponse201 = {
  data: PostScenarios201
  status: 201
}

export type postScenariosResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postScenariosResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postScenariosResponseSuccess = (postScenariosResponse201) & {
  headers: Headers;
};
export type postScenariosResponseError = (postScenariosResponse400 | postScenariosResponse401) & {
  headers: Headers;
};

export type postScenariosResponse = (postScenariosResponseSuccess | postScenariosResponseError)

export const getPostScenariosUrl = () => {




  return `${apiBaseUrl}/scenarios`
}

export const postScenarios = async (scenario: Scenario, options?: RequestInit): Promise<postScenariosResponse> => {

  const res = await fetch(getPostScenariosUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      scenario,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postScenariosResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postScenariosResponse
}



/**
 * @summary Get scenario
 */
export type getScenariosScenarioIdResponse200 = {
  data: GetScenariosScenarioId200
  status: 200
}

export type getScenariosScenarioIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getScenariosScenarioIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getScenariosScenarioIdResponseSuccess = (getScenariosScenarioIdResponse200) & {
  headers: Headers;
};
export type getScenariosScenarioIdResponseError = (getScenariosScenarioIdResponse400 | getScenariosScenarioIdResponse401) & {
  headers: Headers;
};

export type getScenariosScenarioIdResponse = (getScenariosScenarioIdResponseSuccess | getScenariosScenarioIdResponseError)

export const getGetScenariosScenarioIdUrl = (scenarioId: string,) => {




  return `${apiBaseUrl}/scenarios/${scenarioId}`
}

export const getScenariosScenarioId = async (scenarioId: string, options?: RequestInit): Promise<getScenariosScenarioIdResponse> => {

  const res = await fetch(getGetScenariosScenarioIdUrl(scenarioId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getScenariosScenarioIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getScenariosScenarioIdResponse
}



/**
 * @summary Rename/update scenario
 */
export type patchScenariosScenarioIdResponse200 = {
  data: PatchScenariosScenarioId200
  status: 200
}

export type patchScenariosScenarioIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchScenariosScenarioIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchScenariosScenarioIdResponseSuccess = (patchScenariosScenarioIdResponse200) & {
  headers: Headers;
};
export type patchScenariosScenarioIdResponseError = (patchScenariosScenarioIdResponse400 | patchScenariosScenarioIdResponse401) & {
  headers: Headers;
};

export type patchScenariosScenarioIdResponse = (patchScenariosScenarioIdResponseSuccess | patchScenariosScenarioIdResponseError)

export const getPatchScenariosScenarioIdUrl = (scenarioId: string,) => {




  return `${apiBaseUrl}/scenarios/${scenarioId}`
}

export const patchScenariosScenarioId = async (scenarioId: string,
    scenario: Scenario, options?: RequestInit): Promise<patchScenariosScenarioIdResponse> => {

  const res = await fetch(getPatchScenariosScenarioIdUrl(scenarioId),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      scenario,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchScenariosScenarioIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchScenariosScenarioIdResponse
}



/**
 * @summary Delete scenario
 */
export type deleteScenariosScenarioIdResponse204 = {
  data: void
  status: 204
}

export type deleteScenariosScenarioIdResponseSuccess = (deleteScenariosScenarioIdResponse204) & {
  headers: Headers;
};
;

export type deleteScenariosScenarioIdResponse = (deleteScenariosScenarioIdResponseSuccess)

export const getDeleteScenariosScenarioIdUrl = (scenarioId: string,) => {




  return `${apiBaseUrl}/scenarios/${scenarioId}`
}

export const deleteScenariosScenarioId = async (scenarioId: string, options?: RequestInit): Promise<deleteScenariosScenarioIdResponse> => {

  const res = await fetch(getDeleteScenariosScenarioIdUrl(scenarioId),
  {
    ...options,
    method: 'DELETE'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: deleteScenariosScenarioIdResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as deleteScenariosScenarioIdResponse
}



/**
 * @summary Compare two scenarios on balance/income/expenses/savings
 */
export type postScenariosCompareResponse200 = {
  data: void
  status: 200
}

export type postScenariosCompareResponseSuccess = (postScenariosCompareResponse200) & {
  headers: Headers;
};
;

export type postScenariosCompareResponse = (postScenariosCompareResponseSuccess)

export const getPostScenariosCompareUrl = () => {




  return `${apiBaseUrl}/scenarios/compare`
}

export const postScenariosCompare = async (postScenariosCompareBody: PostScenariosCompareBody, options?: RequestInit): Promise<postScenariosCompareResponse> => {

  const res = await fetch(getPostScenariosCompareUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postScenariosCompareBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postScenariosCompareResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as postScenariosCompareResponse
}



/**
 * @summary Derived alert/milestone/tip notifications
 */
export type getNotificationsResponse200 = {
  data: void
  status: 200
}

export type getNotificationsResponseSuccess = (getNotificationsResponse200) & {
  headers: Headers;
};
;

export type getNotificationsResponse = (getNotificationsResponseSuccess)

export const getGetNotificationsUrl = (params?: GetNotificationsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : value.toString())
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `${apiBaseUrl}/notifications?${stringifiedParams}` : `${apiBaseUrl}/notifications`
}

export const getNotifications = async (params?: GetNotificationsParams, options?: RequestInit): Promise<getNotificationsResponse> => {

  const res = await fetch(getGetNotificationsUrl(params),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getNotificationsResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as getNotificationsResponse
}



/**
 * @summary Mark notifications as read
 */
export type postNotificationsReadResponse204 = {
  data: void
  status: 204
}

export type postNotificationsReadResponseSuccess = (postNotificationsReadResponse204) & {
  headers: Headers;
};
;

export type postNotificationsReadResponse = (postNotificationsReadResponseSuccess)

export const getPostNotificationsReadUrl = () => {




  return `${apiBaseUrl}/notifications/read`
}

export const postNotificationsRead = async (postNotificationsReadBody: PostNotificationsReadBody, options?: RequestInit): Promise<postNotificationsReadResponse> => {

  const res = await fetch(getPostNotificationsReadUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postNotificationsReadBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postNotificationsReadResponse['data'] = body ? JSON.parse(body) : undefined
  return { data, status: res.status, headers: res.headers } as postNotificationsReadResponse
}



/**
 * @summary Import JSON/CSV parsed client-side or server-side
 */
export type postImportResponse200 = {
  data: PostImport200
  status: 200
}

export type postImportResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postImportResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postImportResponseSuccess = (postImportResponse200) & {
  headers: Headers;
};
export type postImportResponseError = (postImportResponse400 | postImportResponse401) & {
  headers: Headers;
};

export type postImportResponse = (postImportResponseSuccess | postImportResponseError)

export const getPostImportUrl = () => {




  return `${apiBaseUrl}/import`
}

export const postImport = async (postImportBody: ImportRequest | PostImportBodyTwo, options?: RequestInit): Promise<postImportResponse> => {

  const res = await fetch(getPostImportUrl(),
  {
    ...options,
    method: 'POST'
    ,
    body: JSON.stringify(
      postImportBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postImportResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postImportResponse
}



/**
 * @summary Start export job
 */
export type postExportResponse201 = {
  data: PostExport201
  status: 201
}

export type postExportResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type postExportResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type postExportResponseSuccess = (postExportResponse201) & {
  headers: Headers;
};
export type postExportResponseError = (postExportResponse400 | postExportResponse401) & {
  headers: Headers;
};

export type postExportResponse = (postExportResponseSuccess | postExportResponseError)

export const getPostExportUrl = () => {




  return `${apiBaseUrl}/export`
}

export const postExport = async (postExportBody: PostExportBody, options?: RequestInit): Promise<postExportResponse> => {

  const res = await fetch(getPostExportUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      postExportBody,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: postExportResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postExportResponse
}



/**
 * @summary Get export job/download URL
 */
export type getExportJobIdResponse200 = {
  data: GetExportJobId200
  status: 200
}

export type getExportJobIdResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getExportJobIdResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getExportJobIdResponseSuccess = (getExportJobIdResponse200) & {
  headers: Headers;
};
export type getExportJobIdResponseError = (getExportJobIdResponse400 | getExportJobIdResponse401) & {
  headers: Headers;
};

export type getExportJobIdResponse = (getExportJobIdResponseSuccess | getExportJobIdResponseError)

export const getGetExportJobIdUrl = (jobId: string,) => {




  return `${apiBaseUrl}/export/${jobId}`
}

export const getExportJobId = async (jobId: string, options?: RequestInit): Promise<getExportJobIdResponse> => {

  const res = await fetch(getGetExportJobIdUrl(jobId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getExportJobIdResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getExportJobIdResponse
}



/**
 * @summary Get projection assumptions imported from UI or Excel model
 */
export type getPlansPlanIdAnalyticsAssumptionsResponse200 = {
  data: GetPlansPlanIdAnalyticsAssumptions200
  status: 200
}

export type getPlansPlanIdAnalyticsAssumptionsResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdAnalyticsAssumptionsResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdAnalyticsAssumptionsResponseSuccess = (getPlansPlanIdAnalyticsAssumptionsResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdAnalyticsAssumptionsResponseError = (getPlansPlanIdAnalyticsAssumptionsResponse400 | getPlansPlanIdAnalyticsAssumptionsResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdAnalyticsAssumptionsResponse = (getPlansPlanIdAnalyticsAssumptionsResponseSuccess | getPlansPlanIdAnalyticsAssumptionsResponseError)

export const getGetPlansPlanIdAnalyticsAssumptionsUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/analytics/assumptions`
}

export const getPlansPlanIdAnalyticsAssumptions = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdAnalyticsAssumptionsResponse> => {

  const res = await fetch(getGetPlansPlanIdAnalyticsAssumptionsUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdAnalyticsAssumptionsResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdAnalyticsAssumptionsResponse
}



/**
 * @summary Update projection assumptions
 */
export type patchPlansPlanIdAnalyticsAssumptionsResponse200 = {
  data: PatchPlansPlanIdAnalyticsAssumptions200
  status: 200
}

export type patchPlansPlanIdAnalyticsAssumptionsResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type patchPlansPlanIdAnalyticsAssumptionsResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type patchPlansPlanIdAnalyticsAssumptionsResponseSuccess = (patchPlansPlanIdAnalyticsAssumptionsResponse200) & {
  headers: Headers;
};
export type patchPlansPlanIdAnalyticsAssumptionsResponseError = (patchPlansPlanIdAnalyticsAssumptionsResponse400 | patchPlansPlanIdAnalyticsAssumptionsResponse401) & {
  headers: Headers;
};

export type patchPlansPlanIdAnalyticsAssumptionsResponse = (patchPlansPlanIdAnalyticsAssumptionsResponseSuccess | patchPlansPlanIdAnalyticsAssumptionsResponseError)

export const getPatchPlansPlanIdAnalyticsAssumptionsUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/analytics/assumptions`
}

export const patchPlansPlanIdAnalyticsAssumptions = async (planId: string,
    modelAssumptions: ModelAssumptions, options?: RequestInit): Promise<patchPlansPlanIdAnalyticsAssumptionsResponse> => {

  const res = await fetch(getPatchPlansPlanIdAnalyticsAssumptionsUrl(planId),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      modelAssumptions,)
  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: patchPlansPlanIdAnalyticsAssumptionsResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as patchPlansPlanIdAnalyticsAssumptionsResponse
}



/**
 * @summary Current-year workbook-style balance snapshot
 */
export type getPlansPlanIdAnalyticsBalanceCurrentResponse200 = {
  data: GetPlansPlanIdAnalyticsBalanceCurrent200
  status: 200
}

export type getPlansPlanIdAnalyticsBalanceCurrentResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdAnalyticsBalanceCurrentResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdAnalyticsBalanceCurrentResponseSuccess = (getPlansPlanIdAnalyticsBalanceCurrentResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdAnalyticsBalanceCurrentResponseError = (getPlansPlanIdAnalyticsBalanceCurrentResponse400 | getPlansPlanIdAnalyticsBalanceCurrentResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdAnalyticsBalanceCurrentResponse = (getPlansPlanIdAnalyticsBalanceCurrentResponseSuccess | getPlansPlanIdAnalyticsBalanceCurrentResponseError)

export const getGetPlansPlanIdAnalyticsBalanceCurrentUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/analytics/balance/current`
}

export const getPlansPlanIdAnalyticsBalanceCurrent = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdAnalyticsBalanceCurrentResponse> => {

  const res = await fetch(getGetPlansPlanIdAnalyticsBalanceCurrentUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdAnalyticsBalanceCurrentResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdAnalyticsBalanceCurrentResponse
}



/**
 * Returns income, expense, goal-spending, annual savings and accumulated capital per year. API outflows are positive; netSavings = income - expenses - goalExpenses.
 * @summary Rich yearly cashflow projection based on the Excel model
 */
export type getPlansPlanIdAnalyticsCashflowResponse200 = {
  data: GetPlansPlanIdAnalyticsCashflow200
  status: 200
}

export type getPlansPlanIdAnalyticsCashflowResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdAnalyticsCashflowResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdAnalyticsCashflowResponseSuccess = (getPlansPlanIdAnalyticsCashflowResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdAnalyticsCashflowResponseError = (getPlansPlanIdAnalyticsCashflowResponse400 | getPlansPlanIdAnalyticsCashflowResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdAnalyticsCashflowResponse = (getPlansPlanIdAnalyticsCashflowResponseSuccess | getPlansPlanIdAnalyticsCashflowResponseError)

export const getGetPlansPlanIdAnalyticsCashflowUrl = (planId: string,
    params?: GetPlansPlanIdAnalyticsCashflowParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      normalizedParams.append(key, String(value));
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `${apiBaseUrl}/plans/${planId}/analytics/cashflow?${stringifiedParams}` : `${apiBaseUrl}/plans/${planId}/analytics/cashflow`
}

export const getPlansPlanIdAnalyticsCashflow = async (planId: string,
    params?: GetPlansPlanIdAnalyticsCashflowParams, options?: RequestInit): Promise<getPlansPlanIdAnalyticsCashflowResponse> => {

  const res = await fetch(getGetPlansPlanIdAnalyticsCashflowUrl(planId,params),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdAnalyticsCashflowResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdAnalyticsCashflowResponse
}



/**
 * @summary Pension projection with preserve-capital and spend-down variants
 */
export type getPlansPlanIdPensionProjectionResponse200 = {
  data: GetPlansPlanIdPensionProjection200
  status: 200
}

export type getPlansPlanIdPensionProjectionResponse400 = {
  data: BadRequestResponse
  status: 400
}

export type getPlansPlanIdPensionProjectionResponse401 = {
  data: UnauthorizedResponse
  status: 401
}

export type getPlansPlanIdPensionProjectionResponseSuccess = (getPlansPlanIdPensionProjectionResponse200) & {
  headers: Headers;
};
export type getPlansPlanIdPensionProjectionResponseError = (getPlansPlanIdPensionProjectionResponse400 | getPlansPlanIdPensionProjectionResponse401) & {
  headers: Headers;
};

export type getPlansPlanIdPensionProjectionResponse = (getPlansPlanIdPensionProjectionResponseSuccess | getPlansPlanIdPensionProjectionResponseError)

export const getGetPlansPlanIdPensionProjectionUrl = (planId: string,) => {




  return `${apiBaseUrl}/plans/${planId}/pension/projection`
}

export const getPlansPlanIdPensionProjection = async (planId: string, options?: RequestInit): Promise<getPlansPlanIdPensionProjectionResponse> => {

  const res = await fetch(getGetPlansPlanIdPensionProjectionUrl(planId),
  {
    ...options,
    method: 'GET'


  }
)


  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data: getPlansPlanIdPensionProjectionResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as getPlansPlanIdPensionProjectionResponse
}



