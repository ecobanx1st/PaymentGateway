@extends('layouts.header')
@section('title', 'Security Settings - Admin')
@section('content')
<section class="content">
    <div class="content__inner">
        <header class="content__title">
            <h1>ADMINS LIST</h1>
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

                <div class="row">
                    <div class="col-md-9">
                        <form class="search_change" action="{{ url('admin/subadminsearch') }}" method="get">
                            {{ csrf_field() }}
                            <div class="row">
                                <div class="col-md-3">
                                    <input type="text" name="fromdate" class="form-control date-picker" id="datepicker"
                                        value="{{ $from ?? ''}}" placeholder="Start Date" />
                                </div>
                                <div class="col-md-3">
                                    <input type="text" name="todate" class="form-control date-picker" id="datepicker2"
                                        value="{{ $todate ?? ''}}" placeholder="End Date" />
                                </div>
                                <div class="col-md-3">
                                    <input type="submit" class="btn btn-light" value="Search" />
                                    <a class="btn btn-success btn-xs" href="{{ url('admin/subadminlist') }}"> Reset </a>
                                </div>

                            </div>
                        </form>
                    </div>
                    <!--
        <div class="col-md-2">
        <a class="btn btn-info export" href="#" onclick="exportTableToCSV('subadmin.csv')" ><i class="fa fa-download"></i>&nbsp;Download Excel </a>
        </div> -->
                </div>
                <br />

                <div class="col-md-12 col-sm-12 col-xs-12 pl-0">
                    <div id="sendResult"></div>

                    @if(in_array("write", explode(',',$subadmin->addadmin)))
                    <a href="{{url('admin/subadminform')}}" class="btn btn-light"><i
                            class="fa fa-user-plus zmdi-hc-fw"></i> Add Sub Admin </a>
                </div>
                @endif
                <div class="table-responsive search_result">
                    <table class="table downloaddatas">
                        <!-- //id="allusers-table"  -->
                        <thead>
                            <tr>
                                <th>S.No </th>
                                <th>Username </th>
                                <th>Email </th>
                                <th>Date & Time</th>
                                <!-- <th>logintime</th>
                <th>loginout</th> -->
                                @if(in_array("read", explode(',',$subadmin->addadmin)) || in_array("delete",
                                explode(',',$subadmin->addadmin)))
                                <th>Action</th>
                                @endif
                            </tr>
                        </thead>
                        <tbody>

                            @php
                            $i = 1;
                            @endphp
                            @if (count($admins) > 0)

                            @foreach ($admins as $user)
                            <tr>
                                <td>{{ $i }}</td>
                                <td>{{ $user->name }}</td>
                                <td>@php echo $user->email!= "" ? substr($user->email, 0, 100). "..." : ''; @endphp</td>
                                <td>{{ date('d-m-Y H:i:s',strtotime($user->created_at)) }}</td>
                                <!-- <td>{{ $user->login_time  != ""? $user->login_time  :'-'  }}</td>
            <td>{{ $user->logout_time != "" ? $user->logout_time : '-'  }}</td> -->
                                <td class="td-btns">

                                    @if(in_array("read", explode(',',$subadmin->addadmin)))
                                    <a class="btn btn-success btn-xs"
                                        href="{{ url('admin/subadminedit/'.\Crypt::encrypt($user->id)) }}"><i
                                            class="zmdi zmdi-edit"></i> Edit </a> &nbsp;
                                    @endif

                                    @if(in_array("delete", explode(',',$subadmin->addadmin)))
                                    <a style="color: #000" class="btn btn-success btn-xs" data-toggle="modal"
                                        data-target="#modal-default2_{{ $user->id }}"><i class="zmdi zmdi-delete"></i>
                                        Remove </a>

                                    <div class="modal fade" id="modal-default2_{{ $user->id }}" tabindex="-1">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title pull-left">Remove user</h5>
                                                </div>
                                                <div class="modal-body">Are you want to remove {{ $user->name }}</div>
                                                <div class="modal-footer"> <a
                                                        href="{{ url('admin/subadminremove/'. \Crypt::encrypt($user->id)) }}"
                                                        class="btn btn-success btn-xs">Delete </a>
                                                    <button type="button" class="btn btn-warning btn-xs"
                                                        data-dismiss="modal">Close </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    @endif

                                </td>
                            </tr>
                            @php
                            $i++;
                            @endphp
                            @endforeach

                            @else
                            <tr>
                                <td colspan="5">No records Found</td>
                            </tr>
                            @endif
                        </tbody>

                    </table>
                    @if($admins->count())
                    {{ $admins->links() }}
                    @endif

                </div>
            </div>
        </div>
    </div>
</section>
    @endsection
