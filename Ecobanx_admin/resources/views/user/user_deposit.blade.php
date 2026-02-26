@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Coin deposit history</h1>
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
					@php $title = 'userdeposit'; @endphp
					@include('user.tab')
					<div class="table-responsive search_result">
						<table class="table" id="dows">
							<thead>
								<tr>
									<th>S.No</th>
									<th>Date & Time</th>
									<th>Coin Name</th>
									<th>Recipient</th>
									<th>Sender</th>
									<th>Amount</th>
									<th colspan="2">Action</th>
								</tr>
							</thead>
							<tbody>					
								@if($depositList->count()) 
								@foreach($depositList as $key => $histroy)
								<tr>
									<td>{{ $key+1 }}</td>
									<td>{{ date('Y-m-d h:i:s', strtotime($histroy->created_at)) }}</td>
									<td>{{ $histroy->currency }}</td>
									<td>{{ $histroy->to_addr }}</td>
									<td>{{ $histroy->from_addr }}</td>
									<td>{{ $histroy->amount }}</td>
									<td>
										@if($histroy->status==0)
										<a class="btn btn-success btn-xs" href="{{ url('admin/cryptodeposit/'.Crypt::encrypt($histroy->id)) }}"><i class="zmdi zmdi-edit"></i> View </a>
										@elseif($histroy->status==2)
										Approved
										@elseif($histroy->status==3)
										Cancelled
										@endif 
									</td>
								</tr> 
								@endforeach
								@else 
								<td colspan="7">	{{ 'No record found! ' }}</td>
								@endif
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
	@endsection