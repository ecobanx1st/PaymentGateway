<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        if ($exception instanceof MethodNotAllowedHttpException) {
           return redirect()->back();
        }
        if ($exception instanceof TokenMismatchException) {
            // Redirect to a form. Here is an example of how I handle mine
           return redirect()->back()->with('error', "Oops! Seems you couldn't submit form for a long time. Please try again.");
        }

        // 404 page when a model is not found
        if ($exception instanceof ModelNotFoundException) {
           return response()->view('errors.404', [], 404);
        }
        if ($exception instanceof PostTooLargeException) {

            // return response('File too large!', 422);
            return redirect()->back()->with('error', "Oops! Image may not be greater than 2048 kilobytes..");
            $response1['result']=Null;
            $response1['message']="Invalid URL";
            $response1['error']="image may not be greater than 2048 kilobytes."; 
            $response1['success']="false";
            return response($response1, 422);

        }
		if ($exception instanceof \Swift_TransportException) {
			 return redirect()->back()->with('error', "Somethings went wrong!");
		}
        // custom error message
        if ($exception instanceof \ErrorException) {
          //return response()->view('errors.404', [], 500);
        } else {
            //return parent::render($request, $exception);
        }
        return parent::render($request, $exception);
    }
}
