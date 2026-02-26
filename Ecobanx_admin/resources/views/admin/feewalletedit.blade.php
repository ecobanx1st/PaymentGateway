@php
$atitle ="feewallet";
@endphp

@extends('layouts.header')
@section('title', 'Admin Wallet')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Edit {{ $coin }} Withdrawal Wallet</h1>
    </header>

    
    @if(session('status'))
        <div class="alert alert-success">
          {{ session('status') }}
        </div>
    @endif

    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
              
            </div>
            
      

      </div>
        <form method="POST" action="{{ url('admin/feewalletupdate') }}" id="theform">
          @if (Session::has('success'))
           <div class="alert alert-info">{{ Session::get('success') }}</div>
          @elseif (Session::has('error'))
           <div class="alert alert-danger">{{ Session::get('error') }}</div> 
          @endif

          @if (isset($success))
              <div class="alert alert-info">{{ $success }}</div>
          @endif

          {{ csrf_field() }}
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Coin</label>
              </div>
            </div>
            <div class="col-md-4">
             

              <div class="form-group">
                <input type="text" name="coinname" class="form-control" value="{{ $coin }}" readonly>
                <i class="form-group__bar"></i> </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>From Address</label>
              </div>
            </div>
            <div class="col-md-5">
              <div class="input-group">
                <input type="text" name="fromaddress" class="form-control" value="{{ $fromaddress }}" id="myInput" /><div class="input-group-append">
                <!-- <span class="input-group-text btn btn-warning" id="basic-addon2" onclick="myFunction()">Click to Copy</span> -->
              </div>

                <i class="form-group__bar"></i> </div>
            </div>
          </div>
               
          
          
          
          
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Private Key</label>
              </div>
            </div>
            <div class="col-md-8">
              <div class="form-group">
                <input type="text" name="pvk" class="form-control" value="{{ $pvk }}">
                <i class="form-group__bar"></i> </div>
                @if ($errors->has('pvk'))
                <span class="help-block">
                <strong class="text text-danger">{{ $errors->first('pvk') }}</strong>
                </span>
                @endif
            </div>
          </div>
           <div class="form-group">
              <button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update</button>
            </div>
        </form>
       
      </div>
    </div>
  </div>
</section>
  @endsection
 