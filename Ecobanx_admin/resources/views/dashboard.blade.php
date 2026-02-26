@php
$atitle ="dashboard";
@endphp
@extends('layouts.header')
@section('title', 'Admin Dashboard')
@section('content')
<section class="content">
    <header class="content__title">
        <h1>Dashboard</h1>
    </header>

<div class="row quick-stats listview2">

                <div class="col-sm-6 col-md-4">
                    <div class="quick-stats__item">
                        <div class="quick-stats__info col-md-8">
                            <h2>{{ $details['chat'] }}</h2>
                            <small>Unread Support Tickets</small> </div>
                            <div class="col-md-4 text-right">
                                <h1><i class="zmdi zmdi-ticket-star"></i></h1>
                            </div>
                        </div>
                    </div>

                     <div class="col-sm-6 col-md-4">
                    <div class="quick-stats__item">
                        <div class="quick-stats__info col-md-8">
                            <h2>{{ $details['totalusers'] }}</h2>
                            <small>Total Users</small> </div>
                            <div class="col-md-4 text-right">
                                <h1><i class="zmdi zmdi-accounts-alt"></i></h1>
                            </div>
                        </div>
                    </div>

                     <div class="col-sm-6 col-md-4">
                    <div class="quick-stats__item">
                        <div class="quick-stats__info col-md-8">
                            <h2>{{ $details['kycverify'] }}</h2>
                            <small>KYC Verified Users</small> </div>
                            <div class="col-md-4 text-right">
                                <h1><i class="zmdi zmdi-badge-check"></i></h1>
                            </div>
                        </div>
                    </div>


                </div>
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">Recent Coin Deposit (Pending)</h4>
                    <div class="table-responsive">
                        <table class="table" id="dows">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Date & Time</th>
                            <th>User Name</th>
                            <th>Coin Name</th>
                            <th>Recipient</th>
                            <th>Amount</th>
                            <th colspan="2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    @forelse($details['crypto_deposit'] as $key => $crypto_deposits)
                        <tr>
                            <td>{{ $key+1 }}</td>
                            <td>{{ date('Y-m-d h:i:s', strtotime($crypto_deposits->created_at)) }}</td>
                            <td><a href="{{ url('admin/users_edit/'.Crypt::encrypt($crypto_deposits->uid)) }} ">{{ $crypto_deposits->user['name'] }}</a></td>

                            <td>{{ $crypto_deposits['currency'] }}</td>
                            <td>{{ $crypto_deposits['to_addr'] }}</td>
                            <td>{{ display_format($crypto_deposits->amount,8) }}</td>
                            <td>
                            @if($crypto_deposits->status==0)
                            <a class="btn btn-success btn-xs" href="{{ url('admin/cryptodeposit/'.Crypt::encrypt($crypto_deposits->id)) }}"><i class="zmdi zmdi-edit"></i> View </a>
                            @elseif($crypto_deposits->status==2)
                                Approved
                            @elseif($crypto_deposits->status==3)
                                Cancelled
                            @endif
                            </td>
                        </tr>
                    @empty
                    <tr><td colspan="7">    {{ 'No record found! ' }}</td></tr>
                @endforelse
                    </tbody>
                </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6">
        @if(in_array("kyc", explode(',',$AdminProfiledetails->dashboard)))
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">Recent KYC Submit Users (Pending)</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>User Name</th>
                                    <th>DOB</th>
                                    <th>Country</th>
                                    <th>Kyc Verify</th>
                                    @if(in_array("write", explode(',',$AdminProfiledetails->kyc)))
                                    <th>Action</th>
                                    @endif
                                </tr>
                            </thead>
                            <tbody>
                                @if(!empty($details['kyc_users']))
                                @foreach($details['kyc_users'] as $kyc_users_data)
                                <tr>
                                    <td>{{ date('m-d-Y H:i:s', strtotime($kyc_users_data->created_at)) }}</td>
                                    <td>{{ username($kyc_users_data->uid) }}</td>
                                    <td>{{ date('m-d-Y', strtotime($kyc_users_data->dob)) }}</td>
                                    <td>{{ $kyc_users_data->country }}</td>
                                    <td>Awaiting Confirmation </td>
                                    @if(in_array("write", explode(',',$AdminProfiledetails->kyc)))
                                    <td><a class="btn btn-success btn-xs" href="{{ url('admin/kycview/'.Crypt::encrypt($kyc_users_data->id)) }}"><i class="zmdi zmdi-edit"></i> View </a> </td>
                                    @endif
                                </tr>
                                @endforeach
                                @else
                                <tr><td colspan="6"> No Record Found!</td></tr>
                                @endif
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            @endif
        </div>
         @if(in_array("coinrequest", explode(',',$AdminProfiledetails->dashboard)))
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">Recent Coin Withdraw Request (Pending)</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>User Name</th>
                                    <th>Coin Name</th>
                                    <th>Sender</th>
                                    <th>Recipient</th>
                                    <th>Amount</th>
                                    <th>Fee</th>
                                    @if(in_array("read", explode(',',$AdminProfiledetails->withdrawhistory)))
                                    <th>Status</th>
                                    @endif
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($details['coinwithdraw_request'] as $coinwithdraw)
                                <tr>
                                    <td>{{ date('Y/m/d h:i:s', strtotime($coinwithdraw->created_at)) }}</td>
                                    <td><a href="{{ url('admin/users_edit/'.Crypt::encrypt($coinwithdraw->uid)) }} ">{{  $coinwithdraw->user->name }}</a></td>
                                    <td>{{ $coinwithdraw->coin_name }}</td>
                                    <td>{{ $coinwithdraw->sender }}</td>
                                    <td>{{ $coinwithdraw->reciever }}</td>
                                    <td>{{ number_format($coinwithdraw->request_amount, 8, '.', '') }}</td>
                                    <td>{{ number_format($coinwithdraw->admin_fee, 8, '.', '') }}</td>
                                    <td>
                                        @if($coinwithdraw->status == 0)
                                        @if(in_array("read", explode(',',$AdminProfiledetails->withdrawhistory)))
                                         <a class="btn btn-success btn-xs" href="{{ url('/admin/crypto_withdraw_edit/'.$coinwithdraw->id) }}"><i class="zmdi zmdi-edit"></i> View </a>
                                        @endif
                                        @elseif($coinwithdraw->status == 2)  Cancelled
                                        @elseif($coinwithdraw->status == 1)
                                         Success
                                        @endif
                                    </td>
                                </tr>
                                @empty
                                <tr><td colspan="8"> No Record Found!</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        @endif
        <div class="col-md-6">
            @if(in_array("currencyrequest", explode(',',$AdminProfiledetails->dashboard)))
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">Recent Currency Withdraw Request (Pending)</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>User Name</th>
                                    <th>Currency</th>
                                    <th>Amount</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                @if(!empty($details['withdraw_request']))
                                @foreach($details['withdraw_request'] as $withdraw_requests)
                                <tr>
                                    <td>{{ date('m-d-Y H:i:s', strtotime($withdraw_requests->created_at)) }}</td>
                                    <td>{{username($withdraw_requests->uid)}}</td>
                                    <td>{{ $withdraw_requests->type }}</td>
                                    <td>{{ display_format($withdraw_requests->request_amount, 2) }}</td>
                                    <td>{{ display_format($withdraw_requests->fee, 8) }}</td>
                                    <td>Awaiting Confirmation </td>
                                    <td><a class="btn btn-success btn-xs" href="{{ url('/admin/withdraw_edit/'.Crypt::encrypt($withdraw_requests->id)) }}"><i class="zmdi zmdi-edit"></i> View </a> </td>
                                </tr>
                                @endforeach
                                @else
                                <tr><td colspan="6"> No Record Found!</td></tr>
                                @endif
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            @endif
        </div>
         @if(in_array("supportticket", explode(',',$AdminProfiledetails->dashboard)))
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">Recent Support Ticket</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>User Name</th>
                                    <th>Ticket ID</th>
                                    <th>Subject</th>
                                    <th>Message</th>
                                    @if(in_array("read", explode(',',$AdminProfiledetails->support)))
                                    <th>Action</th>
                                    @endif
                                </tr>
                            </thead>
                            <tbody>
                                @if(!empty($details['support_ticket']))
                                @foreach($details['support_ticket'] as $support_tickets)
                                <tr>
                                    <td>{{ date('m-d-Y H:i:s', strtotime($support_tickets->created_at)) }}</td>
                                    <td>{{ username($support_tickets->uid) }}</td>
                                    <td>{{ $support_tickets->ticket_id }}</td>
                                    <td>{{ $support_tickets->subject }}</td>
                                    <td>{{ $support_tickets->message }}</td>
                                    @if(in_array("read", explode(',',$AdminProfiledetails->support)))
                                    <td><a class="btn btn-success btn-xs" href="{{ url('/admin/reply/'.Crypt::encrypt($support_tickets->id)) }}"><i class="zmdi zmdi-edit"></i> View </a> </td>
                                    @endif
                                </tr>
                                @endforeach
                                @else
                                <tr><td colspan="6"> No Record Found!</td></tr>
                                @endif
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        @endif
    </div>
</section>
@endsection
