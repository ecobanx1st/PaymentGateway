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
              <a class="nav-link active" href="{{ url('/admin/subadminedit/'.Crypt::encrypt($user->id)) }}" role="tab">Sub Admin Details</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="{{ url('/admin/subadminchangepassword/'.Crypt::encrypt($user->id)) }}" role="tab">Sub Admin Change Password</a>
            </li>
          </ul>
          <br>
        </div>
        <form method="post" action="{{ url('admin/subadminupdate/'.$id) }}" autocomplete="off">
          {{ csrf_field() }}
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label for="username">Username</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group ctmcheck {{ $errors->has('username') ? ' has-error' : '' }}">
                <input type="text" name="username" class="form-control" value="{{ $user->name }}" onkeypress="return (event.charCode > 64 && event.charCode < 91) || (event.charCode > 96 && event.charCode < 123)" required="" />
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
                <input type="email" name="email" onkeypress="return AvoidSpace(event)" required pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$" class="form-control" value="{{ $user->email }}" required="" readonly/>
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
                <label for="email">Google 2FA</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group ctmcheck">
                <select name="twofa"  class="form-control" required="required">
                  @if($user->google2fa_verify!=0)
                  <option @if($user->google2fa_verify==1) selected @endif value="1">Enabled</option>
                  <option @if($user->google2fa_verify==2) selected @endif value="2">Disabled</option>
                  @else
                  <option value="0">Not Verified</option>
                  @endif
                </select>
                <i class="form-group__bar"></i>
              </div>
              @if ($errors->has('email'))
              <span class="help-block" style="color:red;">
                <strong>{{ $errors->first('email') }}</strong>
              </span>
              @endif
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
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="kyc"  @if(in_array("kyc", explode(',',$profile->dashboard))) checked @endif/>
                    <span class="checkmark text-warning">KYC Submit</span>
                  </label>
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="currencyrequest"  @if(in_array("currencyrequest", explode(',',$profile->dashboard))) checked @endif />
                    <span class="checkmark text-warning">Currency Withdraw</span>
                  </label>
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="coinrequest"  @if(in_array("coinrequest", explode(',',$profile->dashboard))) checked @endif />
                    <span class="checkmark text-warning">Coin Request</span>
                  </label>
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="dashboard[]" class="checkmark" value="supportticket"  @if(in_array("supportticket", explode(',',$profile->dashboard))) checked @endif />
                    <span class="checkmark text-warning">Support Ticket</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="row mb-20 mt-20">
              <div class="col-md-3"></div>
              <div class="col-md-3">
                <h5>Read </h5>
              </div>
              <div class="col-md-3">
                <h5>Write </h5>
              </div>
              <div class="col-md-3">
                <h5>Delete </h5>
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
                    <input type="checkbox" name="userlist[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->userlist))) checked @endif/>
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="userlist[]" class="checkmark" value="write"  @if(in_array("write", explode(',',$profile->userlist))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="userlist[]" class="checkmark" value="delete"  @if(in_array("delete", explode(',',$profile->userlist))) checked @endif />
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
                    <input type="checkbox" name="merchant_api[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->merchant_api))) checked @endif/>
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_api[]" class="checkmark" value="write"  @if(in_array("write", explode(',',$profile->merchant_api))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_api[]" class="checkmark" value="delete"  @if(in_array("delete", explode(',',$profile->merchant_api))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
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
                    <input type="checkbox" name="merchant_sub[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->merchant_sub))) checked @endif/>
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_sub[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->merchant_sub))) checked @endif/>
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="merchant_sub[]" class="checkmark" value="delete"  @if(in_array("delete", explode(',',$profile->merchant_sub))) checked @endif />
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
                    {{-- <input type="checkbox" name="adminwallet[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->adminwallet))) checked @endif /> --}}
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                 <label>
                    <input type="checkbox" name="adminwallet[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->adminwallet))) checked @endif />
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
                    <input type="checkbox" name="pay_his[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->pay_his))) checked @endif />
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
                  <label>Deposit History</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="deposithistory[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->deposithistory))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="deposithistory[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->deposithistory))) checked @endif />
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
                    <input type="checkbox" name="withdrawhistory[]" class="checkmark" value="read"  @if(in_array("read", explode(',',$profile->withdrawhistory))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="withdrawhistory[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->withdrawhistory))) checked @endif />
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
                  <label>Tokens</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="coinsetting[]" class="checkmark" value="read"  @if(in_array("read", explode(',',$profile->coinsetting))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="coinsetting[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->coinsetting))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="coinsetting[]" class="checkmark" value="delete" @if(in_array("delete", explode(',',$profile->coinsetting))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
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
                    <input type="checkbox" name="commissionsetting[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->commissionsetting))) checked @endif />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-check">
                  <label>
                    <input type="checkbox" name="commissionsetting[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->commissionsetting))) checked @endif />
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
                                            <input type="checkbox" name="kyc[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->kyc))) checked @endif />
                                            <span class="checkmark"></span>
                                          </label>
                                        </div>
                                      </div>
                                      <div class="col-md-3">
                                        <div class="form-check">
                                          <label>
                                            <input type="checkbox" name="kyc[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->kyc))) checked @endif />
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
                                            <input type="checkbox" name="addadmin[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->addadmin))) checked @endif />
                                            <span class="checkmark"></span>
                                          </label>
                                        </div>
                                      </div>
                                      <div class="col-md-3">
                                        <div class="form-check">
                                          <label>
                                            <input type="checkbox" name="addadmin[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->addadmin))) checked @endif />
                                            <span class="checkmark"></span>
                                          </label>
                                        </div>
                                      </div>
                                      <div class="col-md-3">
                                        <div class="form-check">
                                          <label>
                                            <input type="checkbox" name="addadmin[]" class="checkmark" value="delete" @if(in_array("delete", explode(',',$profile->addadmin))) checked @endif />
                                            <span class="checkmark"></span>
                                          </label>
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
        <input type="checkbox" name="support[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->support))) checked @endif />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="support[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->support))) checked @endif />
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
      <label>Security</label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      {{-- <label>
        <input type="checkbox" name="security[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->kyc_settings))) checked @endif/>
        <span class="checkmark"></span>
      </label> --}}
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="security[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->security))) checked @endif />
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
        <input type="checkbox" name="kyc_settings[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->kyc_settings))) checked @endif/>
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="kyc_settings[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->kyc_settings))) checked @endif />
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
        <input type="checkbox" name="cms[]" class="checkmark" value="read" @if(in_array("read", explode(',',$profile->cms_settings))) checked @endif/>
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
  <div class="col-md-3">
    <div class="form-check">
      <label>
        <input type="checkbox" name="cms[]" class="checkmark" value="write" @if(in_array("write", explode(',',$profile->cms_settings))) checked @endif/>
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
