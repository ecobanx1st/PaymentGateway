@php
$atitle ="deposit";
@endphp
@extends('layouts.header')
@section('title', '{{ $coin }} List - Admin')
@section('content')
<section class="content">
	<header class="content__title">
            @php $selectedcoin = \Request::segment(3); @endphp
            <div class="row">
                <div class="col-md-6">
                <h1 style="font-size: 28px !important;">{{ $currency ?? ""}} Deposit History</h1>
            </div>
            <div class="col-md-6">
                <select class="form-control" id="searchstatus" name="searchstatus">
                    <option value="">Select Crypto</option>
                    @foreach (list_coin() as $key => $val)
                        <option value="{{ $val->source ?? '' }}" @if ($selectedcoin == $val->source) selected @endif>
                            {{ $val->source ?? '' }}</option>
                    @endforeach
                </select>
            </div>
            </div>

        </header>
                <div class="row">
            <div class="col-md-6">
                <form action="{{ url('admin/deposits') }}/{{ $selectedcoin ?? '' }}/filter" method="get">
                    {{ csrf_field() }}
                    <input type="text" name="searchnames" id="searchnames" class="form-control"
                        value="{{ $searchphrase ?? '' }}" placeholder="Search by name, email">
                    <button type="submit" id="searchbtn" class="btn btn-primary btn-sm mt-2">Search</button>
                </form>
                <a href="{{ url('admin/deposits') }}/{{ $selectedcoin }}">Reset</a>

            </div>




        </div>
	<div class="card">
		<div class="card-body">
		<div class="table-responsive search_result">
				<table class="table" id="dows">
					<thead>
						<tr>
							<th>S.No</th>
							<th>Date & Time</th>
							<th>User Name</th>
							<th>Email</th>
							<th>Txn ID</th>
							<th>Recipient</th>
							<th>Sender</th>
							<th>Amount</th>
							<th colspan="2">Action</th>
						</tr>
					</thead>
					<tbody>
					@php
			            $i =1;

			            $limit=10;

			            if(isset($_GET['page'])){
							$page = $_GET['page'];
							$i = (($limit * $page) - $limit)+1;
						}else{
						  $i =1;
						}
					@endphp
					@forelse($depositList as $histroy)
						<tr>
							<td>{{ $i }}</td>
							<td>{{ date('d-m-Y h:i:s', strtotime($histroy->created_at)) ?? ""}}</td>
							<td><a href="{{ url('admin/users_edit/'.Crypt::encrypt($histroy->uid)) }} ">{{ $histroy->user->name }}</a></td>
							<td>{{ $histroy->email ?? ""}}</td>
							<td><a href="https://www.blockchain.com/btc/tx/{{ $histroy->txn_id }}" target="_blank" title="{{ $histroy->txn_id }}">{{ mb_strimwidth($histroy->txn_id, 0, 20, "...") }}</a></td>
							<td>{{ $histroy->to_address }}</td>
							<td>{{ $histroy->from_address }}</td>
							<td>{{ number_format($histroy->amount,8) }}</td>

							<td>{{ $histroy->status_text }}</td>
						</tr>
						@php $i++;	@endphp
					@empty
						<tr><td colspan="9">No record found!</td></tr>
					@endforelse
					</tbody>
				</table>

				<div class="col-md-12 col-sm-12 col-xs-12 nopadding">
                <div class="pagination-tt clearfix">
                    @if($depositList->count())
				    {{ $depositList->links() }}
				@endif
                </div>
              </div>

			</div>
		</div>
	</div>
</section>
<script>
        $("#searchstatus").change(function() {
            var searchstatus = $(this).val();
            window.location.href = "{{ url('admin/deposits') }}" + "/" + searchstatus;
        });
    </script>
@endsection


