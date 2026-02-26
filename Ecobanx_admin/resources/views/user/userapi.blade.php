@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', ' Users Wallet')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>User Api Details</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/users') }}"><i class="zmdi zmdi-arrow-left"></i> Back to User</a>
				</br><br>
				@if(session('status'))
				<div class="alert alert-success">
					{{ session('status') }}
				</div>
				@endif
				@php $title = 'userApi'; @endphp
				@include('user.tab')
				<div class="table-responsive search_result">
					<table class="table" id="dows">
						<thead>
							<tr>
								<th>S.No</th>
								<th>PublicKey</th>
								<th>PrivateKey</th>
								<th>IP Address</th>
								<th>Date & Time</th>
							</tr>
						</thead>
						<tbody>					
							@if($api->count()) 
							@foreach($api as $key => $histroy)
							<tr>
								<td>{{ $key+1 }}</td>
								<td>{{ $histroy->public_key }}</td>
								<td>{{ $histroy->private_key }}</td>
								<td>{{ $histroy->ipaddr ? $histroy->ipaddr :'-' }}</td>
								<td>{{ date('Y-m-d h:i:s', strtotime($histroy->created_at)) }}</td>
							</tr> 
							@endforeach
							@else 
							<td colspan="7">	{{ 'No record found! ' }}</td>
							@endif
						</tbody>
					</table>
					<div class="col-md-12 col-sm-12 col-xs-12 nopadding">
						<div class="pagination-tt clearfix">
							@if($api->count())
							{{ $api->links() }}
							@endif
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
@endsection