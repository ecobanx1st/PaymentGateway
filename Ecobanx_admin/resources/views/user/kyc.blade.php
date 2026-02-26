@php
    $atitle = 'kyc';
@endphp
@extends('layouts.header')
@section('title', 'Kyc List - Admin')
@section('content')
    <section class="content">
        <header class="content__title">
            <h1>Kyc Submit</h1>
        </header>
        @if (Session::has('success'))
        <div class="alert alert-info">{{ Session::get('success') }}</div>
        @elseif (Session::has('error'))
        <div class="alert alert-danger">{{ Session::get('error') }}</div>
        @endif

        @if ($message = Session::get('status'))
        <div class="alert alert-danger alert-block">
            <button type="button" class="close" data-dismiss="alert">×</button>
            <strong>{{ $message }}</strong>
        </div>
        @endif
        <div class="card">

            <div class="card-body">
                <form action="{{ url('admin/kyc/filter') }}" method="get">
                    {{ csrf_field() }}
                    <div class="row">
                        <div class="col-md-6">
                            <input type="text" name="searchphrase" value="{{ $search ?? '' }}" class="form-control"
                                placeholder="Search by name...">
                        </div>
                        <div class="col-md-6">
                            <select name="filerst" class="form-control">
                                <option value="">Select Status</option>
                                <option value="0" @if (isset($status) && $status == '0') selected @endif>Waiting</option>
                                <option value="1" @if (isset($status) && $status == '1') selected @endif>Accepted</option>
                                <option value="2" @if (isset($status) && $status == '2') selected @endif>Rejected</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <button type="submit" class="btn btn-primary">Search</button>
                            <a href="{{ url('admin/kyc') }}" class="btn btn-primary">Reset</a>
                        </div>
                </form>
            </div>
            <div class="table-responsive search_result">
                <table class="table" id="dows">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Date & Time</th>
                            <!-- <th>Email</th> -->
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Gender</th>
                            <th>DOB</th>
                            <th>Country</th>
                            <th>State</th>
                            <th>City</th>
                            <th>Zip / Postal Code</th>
                            <th>Telegram Username</th>
                            <th>Address Line1</th>
                            <th>Address Line1</th>
                            <th>Kyc Verify</th>
                            @if (in_array('write', explode(',', $AdminProfiledetails->kyc)))
                                <th colspan="2">Action</th>
                            @endif
                        </tr>
                    </thead>
                    <tbody>
                        @php
                            $i = 1;
                            $limit = 10;
                            if (isset($_GET['page'])) {
                                $page = $_GET['page'];
                                $i = $limit * $page - $limit + 1;
                            } else {
                                $i = 1;
                            }
                        @endphp
                        @forelse($kyc as $key => $user)
                            <tr>
                                <td>{{ $i }}</td>
                                <td>{{ date('m-d-Y H:i:s', strtotime($user->created_at)) }}</td>

                                <!-- <td>{{ $user->email }}</td> -->
                                <td>{{ $user->fname }}</td>
                                <td>{{ $user->lname }}</td>
                                <td>{{ $user->gender_type }}</td>
                                <td>{{ $user->dob }}</td>
                                <td>{{ $user->country }}</td>
                                <td>{{ $user->state }}</td>
                                <td>{{ $user->city }}</td>
                                <td>{{ $user->zip_code }}</td>
                                <td>{{ $user->telegram_name }}</td>
                                <td>{{ $user->address_line1 }}</td>
                                <td>{{ $user->address_line2 }}</td>

                                <td>
                                    @if ($user->status == 0)
                                        Waiting
                                    @elseif($user->status == 1)
                                        Accepted
                                    @elseif($user->status == 2)
                                        Rejected
                                    @else
                                        No
                                    @endif
                                </td>
                                @if (in_array('write', explode(',', $AdminProfiledetails->kyc)))
                                    <td><a class="btn btn-success btn-xs"
                                            href="{{ url('admin/kycview/' . Crypt::encrypt($user->id)) }}"><i
                                                class="zmdi zmdi-edit"></i> View </a> </td>
                                @endif
                            </tr>
                            @php
                                $i++;
                            @endphp
                        @empty
                            <tr>
                                <td colspan="7"> No record found!</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
                <div class="col-md-12 col-sm-12 col-xs-12 nopadding">
                    <div class="pagination-tt clearfix">

                    </div>
                </div>

            </div>
        </div>
        </div>
    </section>
@endsection
