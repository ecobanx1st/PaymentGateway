@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', ' Trade History')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Buy Trade History</h1>
	</header>
	<div class="card">
		<div class="card-body">
				<a href="{{ url('admin/users') }}"><i class="zmdi zmdi-arrow-left"></i> Back to User</a>
					<br /><br />
					@php $title = 'overall'; @endphp
					@include('user.tab')					

			<div class="tab-content">
				<div id="buyo" class="tab-pane fade in active show">
					<div class="row">
						<div class="col-md-6 tg-select-left">
							<select class="form-control custom-s-left" onchange="pageredirect(this)">
		                        <option  @if($type == 'all') selected @endif>All</option>
		                        @foreach($coins as $coin)
		                        <option value="{{ url('/admin/overalltransaction/'.Crypt::encrypt($userdetails->id)).'/'.$coin->source }}" @if($type == $coin->source) selected @endif>{{ $coin->source }}</option>
		                        @endforeach
		                    </select>
						</div>
					</div>
					<div class="table-responsive" style="overflow-x: auto;white-space: nowrap;">
						<table class="table" id="dows">
							<thead>
								<tr>
									<th>SNO</th>
									<th>Date / Time</th>
									<th>Coin</th>
									<th>Type</th>
									<th>Credit</th>
									<th>Debit</th>
									<th>Avail Balance</th>
									<th>Old Balance</th>
									<th>Remark</th>
									<th>Action From</th>
								</tr>
							</thead>
							<tbody>
								@php
						        $limit=20;
						        $i=1;
						        if(isset($_GET['page'])){
						        $page = $_GET['page'];
						        $i = (($limit * $page) - $limit)+1;
						        }else{
						        $i =1;
						        }
						        @endphp
								@forelse($histroys as $history)
								<tr>
									<td>{{ $i }}</td>
									<td>{{ date('d-m-Y H:i:s',strtotime($history->created_at)) }}</td>
									<td>{{ $history->coin }}</td>
									<td>{{ $history->type }}</td>
									<td>{{ $history->credit == 0 ? '' : display_format($history->credit) }}</td>
									<td>{{ $history->debit == 0 ? '' : display_format($history->debit)}}</td>
									<td>{{ display_format($history->balance)}}</td>
									<td>{{ display_format($history->oldbalance)}}</td>
									<td>{{ $history->remark }}</td>
									<td>{{ $history->update_from }}</td>
									@php $i++; @endphp
								</tr>
								@empty
								<tr><td colspan="10">No record found!</td></tr>
								@endforelse
							</tbody>
						</table>
					</div>
					<div class="col-md-12 col-sm-12 col-xs-12 nopadding">
                <div class="pagination-tt clearfix">
                    @if($histroys->count())
				    {{ $histroys->links() }}
				    @endif
                </div>
              </div>
				</div>
			</div>
		</div>
	</div>

@endsection
<script>
    function pageredirect(self){
	window.location.href = self.value;
}
</script>