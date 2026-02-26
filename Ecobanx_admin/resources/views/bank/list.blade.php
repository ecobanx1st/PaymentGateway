@php
$atitle ="adminbank";
@endphp
@extends('layouts.header')
@section('title', 'Admin Bank')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>{{ $fiat }} Admin Bank Details</h1>
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
					@if(count($bank)== 0)
					<div class="row">
						<div class="col-md-6"></div>
						<div class="col-md-6">
							<a href="{{ url('/admin/addbank/'.$fiat) }}" class="btn btn-info pull-right">Add</a>
						</div>
					</div>
					@endif
					<div class="table-responsive search_result">
						<table class="table" id="dows">
							<thead>
								<tr>
									<th>S.No</th>
									<th>Date & Time</th>
									<th>Currency Name</th>
									<th>Bank Details</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								@if(count($bank) > 0)
								@php 
								$i =1;
								$limit=15;
								if(isset($_GET['page'])){
								$page = $_GET['page'];
								$i = (($limit * $page) - $limit)+1;
							}else{
							$i =1;
						}        
						@endphp 
						@foreach($bank as $admin_banks)
						@php $account = strlen($admin_banks->account) > 50 ? substr($admin_banks->account,0,50)."..." : $admin_banks->account;
						@endphp
						<tr>
							<td>{{ $i }}</td>
							<td>{{ date('Y/m/d h:i:s', strtotime($admin_banks->created_at)) }}</td>
							<td>{{ $admin_banks->coin }}</td>
							<td>{{ $account }}</td>
							<td><a class="btn btn-success btn-xs" href="{{ url('/admin/edit_bank/'.Crypt::encrypt($admin_banks->id).'/'.$fiat) }}"><i class="zmdi zmdi-edit"></i> Update </a> </td>
						</tr>
						@php
						$i++;
						@endphp
						@endforeach
						@else
						<tr><td colspan="7"> No record found!</td></tr>
						@endif
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
</div>
</section>
@endsection