import { HttpErrorResponse } from "@angular/common/http";

// Do not display raw backend messages, stack traces, URLs or credentials.
export function apiErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return "We could not reach the server. Check your connection and try again.";
    case 400:
    case 422:
      return "Some details could not be accepted. Check the form and try again.";
    case 401:
      return "Your sign-in details were not accepted, or your session has expired.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "This service is not available. Please contact support if the problem continues.";
    case 409:
      return "This action conflicts with the current data. Refresh and try again.";
    case 408:
    case 504:
      return "The request timed out. Please try again.";
    case 413:
      return "The selected file is too large.";
    case 415:
      return "This file type is not supported.";
    case 429:
      return "Too many attempts. Please wait before trying again.";
    default:
      return "The service could not complete your request. Please try again later.";
  }
}
