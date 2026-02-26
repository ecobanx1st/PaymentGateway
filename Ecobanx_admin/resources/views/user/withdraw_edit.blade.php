@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Withdraw History')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>{{ $withdraw->type }} Withdraw History</h1>
	</header>
	@if(session('status'))
	    <div class="alert alert-success" role="alert">
	        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
	    </div>
	@endif
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/user_fiat_withdraw/'.Crypt::encrypt($withdraw->uid)) }}"><i class="zmdi zmdi-arrow-left"></i> Back to withdraw history</a>
					<br /><br />
				     <form method="post" id="currency_form" action="{{ url('admin/withdraw_update') }}" autocomplete="off">
						{{ csrf_field() }}
						<input type="hidden" value="{{ $withdraw->id }}" name="id">
						<input type="hidden" value="{{ currency($withdraw->type) }}" name="currency">
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Requested Withdraw Amount ({{ $withdraw->type }})</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="amount" class="form-control" value="{{ $withdraw->request_amount != NULL ? number_format($withdraw->request_amount, 2, '.', '') : 'None' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Withdraw Fee ({{ $withdraw->type }})</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="fee" class="form-control" value="{{ $withdraw->fee != NULL ? number_format($withdraw->fee, 2, '.', '') : 'None' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Total Deducted Amount ({{ $withdraw->type }})</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="total_amount" class="form-control" value="{{ $withdraw->amount != NULL ? number_format($withdraw->amount, 2, '.', '') : 'None' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Status</label>
								</div>
							</div>
							@if($withdraw->status == 0)
							<div class="col-md-4">
								<div class="form-group">
									<select class="form-control" name="status">
									    <option value="0">Waiting for approval</option>
										<option value="1">Approved</option>
										<option value="2">Rejected</option>
									</select>
								</div>
							</div>
							<p class="text text-info">NOTE : Once you update the status as "Approved / Rejected", you can't update status again!</p>
							@else
							    @if($withdraw->status == 1) Approved @endif
							    @if($withdraw->status == 2) Rejected @endif
							    @if($withdraw->status == 3) Cancelled by user @endif
							@endif
						</div>
						@if($withdraw->status == 0)
							<div class="form-group">
								<button type="submit" name="edit" id="btn_update" class="btn btn-light"><i class=""></i> Update</button>
							</div>
						@endif
					</form>
					<hr />
					<h5>Bank Details</h5>
					<br /> 
					<form>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Bank Name</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" class="form-control" value="{{ bank($withdraw->bank_id)->bank_name != NULL ? bank($withdraw->bank_id)->bank_name : '---' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div> 
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Account Number</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" class="form-control" value="{{ bank($withdraw->bank_id)->account_number != NULL ? bank($withdraw->bank_id)->account_number : '---' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Account Name</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" class="form-control" value="{{ bank($withdraw->bank_id)->account_name != NULL ? bank($withdraw->bank_id)->account_name : '---' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Bank Code</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" class="form-control" value="{{ bank($withdraw->bank_id)->swift_code != NULL ? bank($withdraw->bank_id)->swift_code : '---' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Bank Branch</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" class="form-control" value="{{ bank($withdraw->bank_id)->bank_branch != NULL ? bank($withdraw->bank_id)->bank_branch : '---' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Bank Branch Code</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" class="form-control" value="{{ bank($withdraw->bank_id)->branch_code != NULL ? bank($withdraw->bank_id)->branch_code : '---' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Bank Address</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" class="form-control" value="{{ bank($withdraw->bank_id)->bank_address != NULL ? bank($withdraw->bank_id)->bank_address : '---' }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection