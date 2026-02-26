@php
$atitle ="withdraw";
@endphp
@extends('layouts.header')
@section('title', 'Withdraw History')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>{{ $currency }} Withdraw History</h1>
	</header>
	<div class="row">
	<div class="col-md-12">
		<div class="card">
			<div class="card-body">
		   <div class="table-responsive search_result">
				<table class="table" id="dows">
					<thead>
						<tr>
							<th>Date & Time</th>
							<th>User Name</th>
							<th>Payment<br>Type</th>
							<th>Requested Withdraw<br>Amount ({{ $currency }})</th>
							<th>Withdraw Fee<br>({{ $currency }})</th>
							<th>Total Deducted<br>Amount ({{ $currency }})</th>
							<th>Status</th>
                            @if(in_array("read", explode(',',$AdminProfiledetails->withdrawhistory)))
							<th>Action</th>
                            @endif
						</tr>
					</thead>
					<tbody>
					    @if(count($transaction) > 0)
					@foreach($transaction as $transactions)
						<tr>
							<td>{{ date('Y/m/d h:i:s', strtotime($transactions->created_at)) }}</td>
							<td>{{ username($transactions->uid) }}</td>
							<td>{{ $transactions->paymenttype}}</td>
							<td>{{ number_format($transactions->request_amount, 2, '.', '') }}</td>
							<td>{{ number_format($transactions->fee, 2, '.', '') }}</td>
							<td>{{ number_format($transactions->amount, 2, '.', '') }}</td>
							<td>
							    @if($transactions->status == 0) Waiting for confirmation
                                @elseif($transactions->status == 2) Rejected by admin
                                @elseif($transactions->status == 3) Cancelled by user
                                @else Approved by admin @endif
							</td>
                            @if(in_array("read", explode(',',$AdminProfiledetails->withdrawhistory)))
							<td><a class="btn btn-success btn-xs" href="{{ url('/admin/withdraw_edit/'.Crypt::encrypt($transactions->id)) }}"><i class="zmdi zmdi-edit"></i> View </a> </td>
                            @endif
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
