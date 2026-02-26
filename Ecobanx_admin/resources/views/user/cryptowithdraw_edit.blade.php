@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Withdraw History')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Withdraw History</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">

					<a href="{{ url('admin/user_withdraw/'.Crypt::encrypt($withdraw->user_id)) }}"><i class="zmdi zmdi-arrow-left"></i> Back to withdraw history</a>
					<br /><br />
					@if(session('status'))
                        <div class="alert alert-success" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
                        </div>
                    @endif
				     <form method="post" id="currency_form" action="{{ url('admin/user_update_cryptowithdraw') }}" autocomplete="off">
				     <input type="hidden" name="id" value="{{ $withdraw->id }}">
						{{ csrf_field() }}
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>User Name</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="recipient" class="form-control" value="{{ $withdraw->user->name }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Sender Address</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="recipient" class="form-control" value="{{ $withdraw->sender }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Recipient Address</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="recipient" class="form-control" value="{{ $withdraw->reciever }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Request Amount</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="amount" class="form-control" value="{{ $withdraw->amount }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Admin Fee</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="admin_fee" class="form-control" value="{{ $withdraw->admin_fee }}" readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-4">
								<div class="form-group">
									<label>Send Amount</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="sendamount" class="form-control" value="{{ $withdraw->request_amount }}" readonly /><i class="form-group__bar"></i>
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
										<option value="2">Approved</option>
										<option value="3">Rejected</option>
									</select>
								</div>
							</div>
							@elseif($withdraw->status == 2)
							<div class="col-md-4">
								<div class="form-group">
										Approved
								</div>
							</div>
							@elseif($withdraw->status == 3)
							<div class="col-md-4">
								<div class="form-group">
										Rejected
								</div>
							</div>
                            @else
							@endif
							<p class="text text-info">NOTE : Once you update the status as "Approved / Rejected", you can't update status again!</p>
						</div>
						@if($withdraw->status == 0)
							<div class="form-group">
								<button type="submit" name="edit" id="btn_update" class="btn btn-light"><i class=""></i> Update</button>
							</div>
						@endif
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection
