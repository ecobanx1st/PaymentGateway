@extends('layouts.header')
@section('title', 'Add sub- Admin')
@section('content')

<section class="content">
<div class="content__inner">
  <header class="content__title">
    <h1> Sub Admin List</h1>
  </header>
    @if(Session::has('message'))
  <p class="alert alert-success">{{ Session::get('message') }}</p>
  @endif

    @if ($error = Session::get('error'))
        <div class="alert alert-warning alert-block">
        <button type="button" class="close" data-dismiss="alert">×</button>
        <strong>{{ $error }}</strong>
        </div>
    @endif
  <div class="card">

  <div class="card-body">


      <a href="{{ url('admin/subadminlist') }}"><i class="zmdi zmdi-arrow-left"></i> Back to Sub Admin List</a>
          <br ><br >
            <div class="tab-container">
            <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item">
            <a class="nav-link" href="{{ url('/admin/subadminedit/'.Crypt::encrypt($user->id)) }}" role="tab">Sub Admin Details</a>
            </li>
            <li class="nav-item">
            <a class="nav-link active" href="{{ url('/admin/subadminchangepassword/'.Crypt::encrypt($user->id)) }}" role="tab">Sub Admin Change Password</a>
            </li>
            </ul>

          <br>
          </div>


  <form method="post" action="{{ url('admin/subadminpassupdate/'.$id) }}" autocomplete="off">
    {{ csrf_field() }}
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label for="username">Username</label>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-group ctmcheck {{ $errors->has('username') ? ' has-error' : '' }}">
          <input type="text" name="username" class="form-control" value="{{ $user->name }}" readonly="readonly" />
          <i class="form-group__bar"></i>
           @if ($errors->has('username'))
              <span class="help-block" style="color:red;">
                  <strong>{{ $errors->first('username') }}</strong>
              </span>
          @endif
          </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label for="email">Email</label>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-group ctmcheck">
          <input type="email" name="email" class="form-control" value="{{ $user->email }}" required="" readonly/>
          <i class="form-group__bar"></i>
          @if ($errors->has('email'))
              <span class="help-block" style="color:red;">
                  <strong>{{ $errors->first('email') }}</strong>
              </span>
          @endif
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label for="password">New Password</label>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-group ctmcheck {{ $errors->has('password') ? ' has-error' : '' }}">
          <input type="Password" name="password" id="password" class="form-control" />
          <i class="form-group__bar"></i>
          @if ($errors->has('password'))
              <span class="help-block" style="color:red;">
                  <strong>{{ $errors->first('password') }}</strong>
              </span>
          @endif
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label>Confirm Password</label>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-group ctmcheck {{ $errors->has('confirmpassword') ? ' has-error' : '' }}">
          <input type="password" name="confirmpassword" id="confirmpassword" class="form-control" value=""  />
          <i class="form-group__bar"></i>
          @if ($errors->has('confirmpassword'))
              <span class="help-block" style="color:red;">
                  <strong>{{ $errors->first('confirmpassword') }}</strong>
              </span>
          @endif
        </div>
      </div>
    </div>

<div class="row">
<div class="col-md-7">
<br>
<div class="form-group">
Notes :
Your password must contain at least 8 characters, one uppercase (ex: A, B, C, etc), one lowercase letter, one numeric digit (ex: 1, 2, 3, etc) and one special character (ex: @, #, $, etc).
</div>
</div>
</div>
@if(in_array("write", explode(',',$AdminProfiledetails->security)))
    <div class="row">
      <div class="col-md-12">
        <div class="form-group">
          <button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update</button>
        </div>
      </div>
    </div>
@endif
    </div>
    </div>
  </form>
</div>
</div>
</div>
@endsection
