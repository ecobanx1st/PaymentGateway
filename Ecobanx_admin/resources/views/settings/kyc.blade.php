@php
$atitle ="cms";
@endphp
@php
$atitle ="kycsetting";
@endphp
@extends('layouts.header')
@section('title', 'KYC Setting')
@section('content')
<section class="content">
<div class="content__inner">
	<header class="content__title">
		<h1>KYC Setting</h1>
	</header>
	@if(session('status'))
	    <div class="alert alert-success" role="alert">
	        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
	            <span aria-hidden="true">&times;</span>
	        </button>
	    {{ session('status') }}
	    </div>
	@endif
	<div class="card">
		<div class="card-body"> 
			<form method="post" autocomplete="off" action="{{ url('admin/securityupdate') }}">
			    {{ csrf_field() }}
				<!-- <div class="row">
					<div class="col-md-3">
							<div class="form-group">
								<label>KYC Information</label>
							</div>
						</div>
					<div class="col-md-8">
						<div class="form-group">
						   <textarea class="form-control" name="kyc_content" rows="4" cols="100">{{ $terms->kyc_content }}</textarea>
						</div>
					</div>
				</div> -->

				<div class="row">
						<div class="col-md-3">
							<div class="form-group">
								<label>KYC</label>
							</div>
						</div>
						<div class="col-md-4">
							<div class="form-group">
							    <div class="form-group">
							       <input name="kycaccess" value="1" type="radio" <?php echo ($terms->kyc_enable=='1')?'checked':'' ?> > Enabled
							       &nbsp;&nbsp;&nbsp;<input name="kycaccess" value="0" type="radio" <?php echo ($terms->kyc_enable=='0')?'checked':'' ?> > Disabled (Except Withdraw)
								</div>
							</div>
						</div>
				</div>
				<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>2FA settings during user withdraw</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
								    <div class="form-group">
								       <input name="twofawithdraw" value="1" type="radio" <?php echo ($terms->twofa_withdraw_enable=='1')?'checked':'' ?>> Enabled
								       &nbsp;&nbsp;&nbsp;<input name="twofawithdraw" value="0" type="radio" <?php echo ($terms->twofa_withdraw_enable=='0')?'checked':'' ?>> Disabled 
									</div>
								</div>
							</div>
						</div>

			

				<div class="form-group">
					<button type="submit" name="update_content" class="btn btn-light"><i class=""></i> Update</button>
				</div>
			</form>
		</div>
	</div>
</div>
@endsection