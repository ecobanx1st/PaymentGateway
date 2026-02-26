@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Withdraw History')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Currency Withdraw History</h1>
	</header>
	<div class="row">
	<div class="col-md-12">
		<div class="card">
			<div class="card-body">
				<a href="{{ url('admin/users') }}"><i class="zmdi zmdi-arrow-left"></i> Back to User</a>
					<br /><br />
					@php $title = 'user_fiat_withdraw'; @endphp
					@include('user.tab')

		   <div class="table-responsive search_result">
				<table class="table" id="dows">
					<thead>
						<tr>
							<th>Date & Time</th>
							<th>Currency</th>
							<th>Requested Withdraw Amount</th>
							<th>Withdraw Fee</th>
							<th>Total Deducted Amount</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
					    @if(count($transaction) > 0)
					@foreach($transaction as $transactions)
						<tr>
							<td>{{ date('Y/m/d h:i:s', strtotime($transactions->created_at)) }}</td>
							<td>{{ $transactions->type }}</td>
							<td>{{ number_format($transactions->request_amount, 2, '.', '') }}</td>
							<td>{{ number_format($transactions->fee, 2, '.', '') }}</td>
							<td>{{ number_format($transactions->amount, 2, '.', '') }}</td>
							<td>
							    @if($transactions->status == 0) Waiting for admin confirmation
                                @elseif($transactions->status == 2) Rejected by admin
                                @elseif($transactions->status == 3) Cancelled by user
                                @else Approved by admin @endif
							</td>
							<td><a class="btn btn-success btn-xs" href="{{ url('/admin/fiat_withdraw_edit/'.Crypt::encrypt($transactions->id)) }}"><i class="zmdi zmdi-edit"></i> View </a> </td>
						</tr>
					@endforeach
					@else
					    <tr><td colspan="7"> No record found!</td></tr>
					@endif
					</tbody>
				</table>
				<div class="col-md-12 col-sm-12 col-xs-12 nopadding">
                <div class="pagination-tt clearfix">
                    @if($transaction->count())
				    {{ $transaction->links() }}
				@endif
                </div>
              </div>
			</div>
		</div>
	</div>
	</div>
	</div>
</section>
@endsection