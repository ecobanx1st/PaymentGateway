@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
<section class="content">
    <header class="content__title">
        <h1>Users</h1>
    </header>
    @if (Session::has('success'))
        <div class="alert alert-info">{{ Session::get('success') }}</div>
        @elseif (Session::has('error'))
        <div class="alert alert-danger">{{ Session::get('error') }}</div>
        @endif

        @if ($message = Session::get('searcherror'))
        <div class="alert alert-danger alert-block">
            <button type="button" class="close" data-dismiss="alert">×</button>
            <strong>{{ $message }}</strong>
        </div>
        @endif
    <div class="card">
        <div class="card-body">
            <form action="{{ url('/admin/users/search') }}" method="get" autocomplete="off">
                {{ csrf_field() }}
                <div class="row">
                    <div class="col-md-3">
                        <input type="text" name="searchitem" class="form-control"
                            placeholder="Search for Full Name or Email" value="{{ $searchable ?? ""}}" required>
                    </div>
                    <div class="col-md-3">
                        <input type="submit" class="btn btn-success user_date" value="Search" />
                        <a class="btn btn-warning btn-xs" href="{{ url('admin/users') }}"> Reset </a>
                    </div>
                </div>
            </form>
            <br />
            <br />
            @if($details)
            <h5> Total Users : {{ count($details) }} </h5>
            <hr />
            @endif
            @if ($message = Session::get('error'))
            <div class="alert alert-danger alert-block">
                <button type="button" class="close" data-dismiss="alert">×</button>
                <strong>{{ $message }}</strong>
            </div>
            @endif
            @if ($message = Session::get('success'))
            <div class="alert alert-success alert-block">
                <button type="button" class="close" data-dismiss="alert">×</button>
                <strong>{{ $message }}</strong>
            </div>
            @endif
            <div class="table-responsive search_result">
                <table class="table" id="dows">
                    <thead>
                        <tr>
                            <th>S.NO</th>
                            <th>Joining Date and Time</th>
                            <th>Full Name</th>
                            <th>Email ID</th>
                            <th>Merchants Api</th>
                            <th>Email Verify</th>
                            <th>Kyc Verify</th>
                            @if(in_array("delete", explode(',',$AdminProfiledetails->userlist)) || in_array("write", explode(',',$AdminProfiledetails->userlist)))
                            <th colspan="3">Action</th>
                            @endif
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
                        @forelse($details as $user)
                        <tr>
                            <td>{{ $i }}</td>
                            <td>{{ date('Y/m/d h:i:s', strtotime($user->created_at)) }}</td>
                            <td>{{ $user->name,0,20, "..." ?? ''}}</td>
                            <td>{{ $user->email }}</td>
                            <td>{{ $user->merchant_id,0,20, "..." ?? '' }}</td>
                            <td>@if($user->email_verify == 1) Yes @elseif($user->email_verify == 2) Waiting @else No
                                @endif</td>
                            <td>@if($user->kyc_verify == 1) Yes @elseif($user->kyc_verify == 2) Waiting @else No @endif
                            </td>
                            @if(in_array("read", explode(',',$AdminProfiledetails->userlist)))
                            <td><a class="btn btn-success btn-xs"
                                    href="{{ url('/admin/users_edit/'.Crypt::encrypt($user->id)) }}"><i
                                        class="zmdi zmdi-edit"></i> View </a>
                                @endif
                                @if(in_array("delete", explode(',',$AdminProfiledetails->userlist)))
                                <a onclick="return confirm('Are you sure you want to delete this User?');"
                                    class="btn btn-danger btn-xs" data-toggle="tooltip" title="Delete User"
                                    href="{{ url('/admin/deleteuser/'.Crypt::encrypt($user->id)) }}"><i
                                        class="zmdi zmdi-delete zmdi-hc-fw"></i> DELETE </a>
                            </td>
                            @endif
                        </tr>
                        @php $i++; @endphp
                        @empty
                        <tr>
                            <td colspan="7"> No record found!</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
                <div class="col-md-12 col-sm-12 col-xs-12 nopadding">
                    <div class="pagination-tt clearfix">
                        @if($details->count())
                        {{ $details->links() }}
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
