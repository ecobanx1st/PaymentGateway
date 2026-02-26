<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<title>Admin Panel | {{ config('app.name') }} </title>
   <!-- favicon -->
   <link rel="apple-touch-icon" sizes="180x180" href="{{ url('favicon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('favicon/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('/favicon/favicon-16x16.png') }}">
    <!-- favicon !-->

<!-- Vendor styles -->
<link rel="stylesheet" href="{{ url('adminpanel/css/material-design-iconic-font.min.css') }}">
<link rel="stylesheet" href="{{ url('adminpanel/css/animate.min.css') }}">
<!-- App styles -->
<link rel="stylesheet" href="{{ url('adminpanel/css/app.min.css') }}">
</head>
<body data-sa-theme="7">
<!-- Login -->


<div class="login-page-flex-block">

   <!-- <div class="right-img">
   <img src="{{ url('/images/otp-pageright-img.svg') }}" class="logo-text" />
   </div> -->


<div class="login">

<div class="login__block active sectnbox" id="l-login">

<!-- <img src="{{ url('/images/logo.png') }}" class="logo-text" /> -->

<!-- <div class="login__block__header">
@if($user->google2fa_verify==0)
To enable 2FA, Scan the QR code shown on the page using an authenticator app like Google Authenticator                  
@else
Google Authenticator            
@endif
</div> -->

<div class="login__block__body">
@if(Session::has('error'))
<p class="alert alert-danger">{{ Session::get('error') }}</p>
@endif


<form method="post" class="form-horizontal" action="{{ url('/admin/google_admin_verfiy') }}">                       
{{ csrf_field() }}
<div class="panel panel-content panel-default panel-border bottom-line kyc-boxes">
<div class="">
<div class="text-center">
<h4>
<!-- @if($user->google2fa_verify==0)
{{ __('common.Install_Google_Authenticator') }} 
@endif -->
</h4>
</div>
<div class="kyc-box">
<div class="text-center split-box col-xs-12">
<div class="">
<div class="grey-box">
<div>
@if(isset($image))
@if($user->google2fa_verify==0)
<div class="qr-code-pic"> {{ $image }}</div>
@endif
@else
@endif
</div>
<h3>Google Verification</h3>
@if (session('warning'))
<div class="alert alert-warning">
{{ session('warning') }}
</div>
@endif
<div class="form-group  has-feedback">
<label class="col-xs-12">Enter the 6 digits code</label>
<div class="col-xs-12 inputGroupContainer">
<input id="otp" type="number" class="form-control" name="otp" value="{{ old('otp') }}"  onkeyup="if (/[^0-9.]/g.test(this.value)) this.value = this.value.replace(/[^0-9.]/g,'')" required autofocus>
@if ($errors->has('otp'))
<span class="help-block">
<strong>{{ $errors->first('otp') }}</strong>
</span>
@endif                                    
</div>
</div>
<div class="text-center form-group">        
<input type="submit" class="btn btn-success site-btn mt-20 text-uppercase nova-font-bold" value="Submit">
</div>

</div>
</div>
</div>
</div>
</div>
</div> 
</form>
</div>
</div>
</div>

</div>

<script src="{{ url('adminpanel/js/jquery.min.js') }}"></script>
<script src="{{ url('adminpanel/js/popper.min.js') }}"></script>
<script src="{{ url('adminpanel/js/bootstrap.min.js') }}"></script>
<script src='https://www.google.com/recaptcha/api.js'></script>
<script src="{{ url('adminpanel/js/app.min.js') }}"></script>
</body>
</html>