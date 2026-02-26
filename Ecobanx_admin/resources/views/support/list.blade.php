@php
    $atitle = 'support';
@endphp
@extends('layouts.header')
@section('title', 'Support Ticket')
@section('content')
    <section class="content">
        <header class="content__title">
            <h1>Support</h1>
        </header>
        <div class="card">
            </br>


            <div class="card-body">
                <form action="{{ url('admin/support/filter') }}" method="get">
                {{ csrf_field() }}
                <div class="row">
                    <div class="col-md-3">
                        <input type="text" name="searchphrase" value="{{ $search ?? '' }}" class="form-control" placeholder="Search by ticket id, name">
                    </div>
                    <div class="col-md-3">
                        <input type="date" name="datefilter" value="{{ $dateFilter ?? '' }}" class="form-control" placeholder="Search by ticket id, name">
                    </div>
                    <div class="col-md-3">
                        <button type="submit" class="btn btn-primary">Search</button>
                        <a href="{{ url('admin/support') }}" class="btn btn-primary">Reset</a>
                    </div>
                </div>

            </form>
                <div class="table-responsive">
                    @if ($tickets->count() > 0)
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Ticket Id</th>
                                    <th>Full name</th>
                                    <th>Subject</th>
                                    @if (in_array('read', explode(',', $AdminProfiledetails->support)))
                                        <th>Action</th>
                                    @endif
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($tickets as $ticket)
                                    <tr>
                                        <td>{{ date('d-m-Y H:i:s', strtotime($ticket->created_at)) ?? '' }}</td>
                                        <td>{{ $ticket->ticket_id ?? '' }}</td>
                                        <td>{{ $ticket->name ?? '' }}</td>
                                        <td>{{ $ticket->subject ?? '' }}</td>
                                        @if (in_array('read', explode(',', $AdminProfiledetails->support)))
                                            <td><a class="btn btn-primary btn-xs"
                                                    href="{{ url('/admin/reply/' . Crypt::encrypt($ticket->id)) }}"
                                                    class="btn btn-info">Chat</a></td>
                                        @endif
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @else
                        Yet no one raise support ticket
                    @endif
                </div>
            </div>
        </div>
        <div class="modal fade" id="confirm-delete" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
            aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header"> Delete </div>
                    <div class="modal-body"> Are you sure you want to delete this user? </div>
                    <div class="modal-footer"> <a class="btn btn-danger btn-ok">Yes</a>
                        <button type="button" class="btn btn-default" data-dismiss="modal">No</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </section>
@endsection
