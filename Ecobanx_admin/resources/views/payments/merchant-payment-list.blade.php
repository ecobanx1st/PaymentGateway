@php
$atitle ="merchanthistroy";
@endphp
@extends('layouts.header')
@section('title', 'Merchant Transaction List - Admin')
@section('content')
<section class="content">
    <header class="content__title">
        <h1>Merchant payment History</h1>
    </header>
    <div class="card">
        <div class="card-body">
            <div class="selcet-row">
                <?php $currency2 = $coinlists; ?>
                <select onchange="location = this.value;" class="form-control">
                    <option value="{{ url('admin/merchant-histroy') }}" selected>All Currency 1</option>
                    @foreach($coinlists as $coinlists)
                    <option value="{{ url('admin/merchant-histroy?coin='.$coinlists->source) }}" @if(request()->
                        query('coin') == $coinlists->source) selected @endif>{{ $coinlists->source }}</option>
                    @endforeach
                </select>

                <select onchange="location = this.value;" class="form-control">
                    <option value="{{ url('admin/merchant-histroy') }}" selected>All Currency 2</option>
                    @foreach($currency2 as $value)
                    <option value="{{ url('admin/merchant-histroy?coin1='.$value->source) }}" @if(request()->
                        query('coin1') == $value->source) selected @endif>{{ $value->source }}</option>
                    @endforeach
                </select>

                <select onchange="location = this.value;" class="form-control">
                    <option value="{{ url('admin/merchant-histroy') }}" selected>All Status</option>
                    <option value="{{ url('admin/merchant-histroy?status=100') }}" @if(request()->query('status') ==
                        100) selected @endif>Success</option>
                    <option value="{{ url('admin/merchant-histroy?status=-1') }}" @if(request()->query('status') == -1)
                        selected @endif>Cancelled / Timed Out </option>

                </select>
            </div>


            <div class="table-responsive search_result">
                <table class="table" id="dows">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Date & Time</th>
                            <th>Txn ID</th>
                            <th>Address</th>
                            <th>Coin</th>
                            <th>Amount</th>
                            <th>Status</th>
                            @if(in_array("read", explode(',',$AdminProfiledetails->pay_his)))
                            <th colspan="2">Action</th>
                            @endif
                        </tr>
                    </thead>
                    <tbody>
                        @php
                        $i =1;

                        $limit=20;

                        if(isset($_GET['page'])){
                        $page = $_GET['page'];
                        $i = (($limit * $page) - $limit)+1;
                        }else{
                        $i =1;
                        }
                        @endphp
                        @forelse($histroys as $data)
                        <tr>
                            <td>{{ $i }}</td>
                            <td>{{ date('d-m-Y H:i:s',strtotime($data->created_at)) }}</td>
                            <td>{{ $data->txn_id, 0, 20, "..." ?? ''}}</td>
                            <td>{{ $data->payment_address, 0, 20, "..." ?? ''}}</td>
                            <td>{{ $data->currency1 }}</td>
                            <td>{{ $data->amount1 }}</td>
                            <td>{{ $data->status_text, 0, 20, "..." ?? ''}}</td>
                            <td>{{ $data->status }}</td>
                            @if(in_array("read", explode(',',$AdminProfiledetails->pay_his)))
                            <td><a href="{{ url('/admin/merchantview/'.Crypt::encrypt($data->id)) }}">View Details</a>
                            </td>
                            @endif
                        </tr>
                        @php $i ++; @endphp
                        @empty
                        <tr>
                            <td colspan="10">No record found!</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>

                <div class="col-md-12 col-sm-12 col-xs-12 nopadding">
                    <div class="pagination-tt clearfix">
                        @if((!request()->has('coin')) && (!request()->has('coin1')) && (!request()->has('status')) )
                        @if($histroys->count())
                        {{ $histroys->links() }}
                        @endif
                        @endif
                    </div>
                </div>

            </div>
        </div>
    </div>
</section>
@endsection
