@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>User Commission Setting</h1>
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
					@php $title = 'usercommissionsetting'; @endphp
					@include('user.tab')
					<div class="table-responsive search_result">
						@if(count($commissions))
						<table class="table">
							<thead>
								<tr>
									<th>S.No</th>
									<th>Coin / Currency</th>
									<th>Name</th>
									<th>Withdraw %</th>
									<th>Net Fee</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody> 
								@foreach($commissions as $key => $commission)
								<tr>
									<td>{{ $key+1 }}</td>
									<td>{{ $commission->source }}</td>
									<td>{{ $commission->coinname }}</td>
									<td>{{ $commission->withdraw }}</td>
									<td>{{ number_format($commission->netfee, 8) }}</td>
									<td><a href="{{ url('/admin/editusercommissionsettings', Crypt::encrypt($commission->id)) }}" class="btn btn-info">View / Edit</a></td>
								</tr>
								@endforeach
							</tbody>
						</table>
						{{ $commissions->links() }}
						@else
						<p>To Set Commission For This User ( {{$userdetails->name}} ).&nbsp;<a href="{{ url('/admin/createusercommission', Crypt::encrypt($userdetails->id)) }}">Click Here</a></p>
						@endif
					</div>
				</div>
			</div>
		</div>
	</div>
	@endsection