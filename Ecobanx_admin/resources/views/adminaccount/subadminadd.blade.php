
@extends('layouts.header')
@section('title', 'Add sub- Admin')
@section('content')

<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Sub Admin </h1>
    </header>
    <div class="card">
      <div class="card-body customcheck">
        <a href="{{ url('admin/subadminlist') }}"><i class="zmdi zmdi-arrow-left"></i> Back</a>
        <br>
        <p class=" text-warning">Sub Admin :-</p>
        <br />
        @if (count($errors) > 0)
        <div class="alert alert-danger">
          <ul>
            @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
            @endforeach
          </ul>
        </div>
        @endif

        @if ($error = Session::get('error'))
        <div class="alert alert-warning alert-block">
          <button type="button" class="close" data-dismiss="alert">×</button>
          <strong>{{ $error }}</strong>
        </div>
        @endif
        <form method="post" action="{{ url('admin/subadmincreated') }}" autocomplete="off">
          {{ csrf_field() }}
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label for="username">Username</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group ctmcheck {{ $errors->has('username') ? ' has-error' : '' }}">
                <input type="text" onkeypress="return (event.charCode > 64 && event.charCode < 91) || (event.charCode > 96 && event.charCode < 123)" name="username" class="form-control" id="username" value="{{ old('username') }}" required />
                <i class="form-group__bar"></i>
              </div>
              @if ($errors->has('username'))
              <span class="help-block" style="color:red;">
                <strong>{{ $errors->first('username') }}</strong>
              </span>
              @endif
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
                <input type="email" name="email" onkeypress="return AvoidSpace(event)" required pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$" class="form-control" value="{{ old('email') }}" required />
                <i class="form-group__bar"></i>
              </div>
              @if ($errors->has('email'))
              <span class="help-block" style="color:red;">
                <strong>{{ $errors->first('email') }}</strong>
              </span>
              @endif
            </div>
          </div>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label for="password">Password</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group ctmcheck {{ $errors->has('password') ? ' has-error' : '' }}">
                <input type="password" name="password"  id="password" class="form-control" value  required />
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
                <input type="password" name="confirmpassword"  id="confirmpassword" class="form-control" value required />
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
              <div class="form-group">
                Notes :
                Your password must contain at least 8 characters, one uppercase (ex: A, B, C, etc), one lowercase letter, one numeric digit (ex: 1, 2, 3, etc) and one special character (ex: @, #, $, etc).
              </div>
            </div>
          </div>


          <div class="checkmrkbox">

            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Dashboard</label>
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="kyc" />
                    <span class="checkmark text-warning">KYC Sumbit</span>
                  </label>
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="currencyrequest" />
                    <span class="checkmark  text-warning">Currency Withdraw</span>
                  </label>
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="coinrequest" />
                    <span class="checkmark  text-warning">Coin Withdraw</span>
                  </label>
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="supportticket" />
                    <span class="checkmark  text-warning">Support Ticket</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="row mb-20 mt-20">
              <div class="col-md-3"></div>
              <div class="col-md-3">
                <h5>Read</h5>
              </div>
              <div class="col-md-3">
                <h5>Write</h5>
              </div>
              <div class="col-md-3">
                <h5>Delete</h5>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Users List</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="userlist[]" class="checkmark" value="read" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="userlist[]" class="checkmark" value="write" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="userlist[]" class="checkmark" value="delete"  />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
            </div>

              <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Merchant Api</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_api[]" class="checkmark" value="read" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_api[]" class="checkmark" value="write" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
               <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_api[]" class="checkmark" value="delete" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  {{-- <label>
                    <input type="checkbox" name="refferalcommission[]" class="checkmark" value="delete"  />
                    <span class="checkmark"></span>
                  </label> --}}
                </div>
              </div>
            </div>

              <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Merchant Sub</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_sub[]" class="checkmark" value="read" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_sub[]" class="checkmark" value="write" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_sub[]" class="checkmark" value="delete"  />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
            </div>


            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Admin Wallet</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="adminwallet[]" class="checkmark" value="read" />
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="adminwallet[]" class="checkmark" value="write" />
                  </label>

                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">

                </div>
              </div>
            </div>

             <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Payment History</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="pay_his[]" class="checkmark" value="read" />
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">

                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">

                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Tokens</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="coinsetting[]" class="checkmark" value="read" />
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="coinsetting[]" class="checkmark" value="write" />
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  {{-- <label>
                    <input type="checkbox" name="coinsetting[]" class="checkmark" value="delete" />
                  </label> --}}
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Deposit History</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="deposithistory[]" class="checkmark" value="read" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="deposithistory[]" class="checkmark" value="write" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">

                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Withdraw History</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="withdrawhistory[]" class="checkmark" value="read" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="withdrawhistory[]" class="checkmark" value="write" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">

                </div>
              </div>
            </div>
              <div class="col-md-3">
                <div class="form-check">

                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Commission Settings</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="commissionsetting[]" class="checkmark" value="read" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="commissionsetting[]" class="checkmark" value="write" />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">

                </div>
              </div>
            </div>

<div class="row">
  <div class="col-md-3">
    <div class="form-group">
      <label>KYC</label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="kyc[]" class="checkmark" value="read" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="kyc[]" class="checkmark" value="write" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">

    </div>
  </div>
</div>
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label>Add Sub Admin</label>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-check">
                              <label>
                                <input type="checkbox" name="addadmin[]" class="checkmark" value="read" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-check">
                              <label>
                                <input type="checkbox" name="addadmin[]" class="checkmark" value="write" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-check">
                              <label>
                                <input type="checkbox" name="addadmin[]" class="checkmark" value="delete" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                        </div>


                         <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label>security</label>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-check">
                              {{-- <label>
                                <input type="checkbox" name="security[]" class="checkmark" value="read" />
                                <span class="checkmark"></span>
                              </label> --}}
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-check">
                              <label>
                                <input type="checkbox" name="security[]" class="checkmark" value="write" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-check">
                              {{-- <label>
                                <input type="checkbox" name="addadmin[]" class="checkmark" value="delete" />
                                <span class="checkmark"></span>
                              </label> --}}
                            </div>
                          </div>
                        </div>


<div class="row">
  <div class="col-md-3">
    <div class="form-group">
      <label> Support</label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="support[]" class="checkmark" value="read" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="support[]" class="checkmark" value="write" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">

    </div>
  </div>
</div>
{{-- <div class="row">
  <div class="col-md-3">
    <div class="form-group">
      <label> KYC Settings</label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="kyc_settings[]" class="checkmark" value="read" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="kyc_settings[]" class="checkmark" value="write" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">

    </div>
  </div>
</div> --}}
<div class="row">
  <div class="col-md-3">
    <div class="form-group">
      <label> Site Settings</label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="cms[]" class="checkmark" value="read" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="cms[]" class="checkmark" value="write" />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">

    </div>
  </div>
</div>
</div>

@if(in_array("write", explode(',',$AdminProfiledetails->addadmin)))
<div class="row">
  <div class="col-md-12">
    <div class="form-group">
      <button type="submit" name="edit" class="btn btn-light"><i class></i>Create Subadmin </button>
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
