@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Currency deposit history</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/users') }}"><i class="zmdi zmdi-arrow-left"></i> Back to User</a>
					<br /><br />
					@if(session('updated_status'))
					    <div class="alert alert-success">
                              {{ session('updated_status') }}
                        </div>
					@endif

					@php $title = 'userfiatdeposit'; @endphp
					@include('user.tab')
							   <div class="table-responsive search_result">
				<table class="table" id="dows">
					<thead>
						<tr>
							<th>Date & Time</th>
							<th>Currency</th>
							<th>Payment Type</th>
							<th>Deposited Amount</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
					    @if(count($deposit) > 0)
						@foreach($deposit as $transactions)
						<tr>
							<td>{{ date('Y-m-d h:i:s', strtotime($transactions->created_at)) }}</td>
							<td>{{ $transactions->currency }}</td>
							<td>{{ $transactions->type ? $transactions->type :'-'  }}</td>
							<td>{{ number_format($transactions->amount, 2, '.', '') }}</td>
							<td>
							    @if($transactions->status == 0) 
							    	Waiting for admin confirmation
                                @elseif($transactions->status == 2) 	
                                	Rejected by admin
                                @elseif($transactions->status == 3) 
                                	Cancelled by user
                                @else 
                                	Approved by admin 
                                @endif
							</td>
							<td>
								@if($transactions->status == 0) 
									<a class="btn btn-success btn-xs" href="{{ url('/admin/user_fiatdeposit_edit/'.Crypt::encrypt($transactions->id)) }}"><i class="zmdi zmdi-edit"></i> View </a>
                                @else 
                                	--
                                @endif 

							</td>
						</tr>
					@endforeach
					@else
					    <tr><td colspan="7"> No record found!</td></tr>
					@endif
					</tbody>
				</table>
				@if(count($deposit) > 0)
				    {{ $deposit->links() }}
				@endif
			</div>

				</div>
			</div>
		</div>
	</div>
@endsection