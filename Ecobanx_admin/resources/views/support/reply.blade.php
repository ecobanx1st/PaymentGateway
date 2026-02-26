@php
$atitle ="support";
@endphp
@extends('layouts.header')
@section('title', 'Tickets - Reply')
@section('content')
<style>
    .blacktxt{
        color:black !important;
    }
</style>
<section class="content">
<div class="content__inner">
<header class="content__title">
<h1>Message</h1>
<div class="top-btn"><a href="{{ url('/admin/support') }}"><i class="zmdi zmdi-arrow-left zmdi-hc-fw" aria-hidden="true"></i> Back</a></div>
</header>
@if ($message = Session::get('success'))
<div class="alert alert-success alert-block">
<button type="button" class="close" data-dismiss="alert">×</button>
<strong>{{ $message }}</strong>
</div>
@endif
@if ($message = Session::get('failed'))
<div class="alert alert-danger alert-block">
<button type="button" class="close" data-dismiss="alert">×</button>
<strong>{{ $message }}</strong>
</div>
@endif
<div class="alert alert-danger"  style="display:none;" id="require_msg" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
<strong>Failed! </strong>Must fill all the fields!
</div>
<div class="alert alert-success"  style="display:none;" id="sug_msg" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
<strong>success! </strong>Added successfully!
</div>
<div class="alert alert-danger"  style="display:none;" id="fail_msg" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
<strong>Failed! </strong>Try again!
</div>
</div>
<div id="fail_msg"></div>
<div class="messages">
<div class="messages__body">
<div class="messages__header">
<div class="toolbar toolbar--inner mb-0">
<div class="toolbar__label">Send by : {{ $username }}</div>
</div>
</div>
<div class="messages__content" id="adminchat_div">
@if($chatlist)
@foreach ($chatlist as $row)
@if($row->message!="")
<div class="messages__item">
<div class="messages__details">
@if($userlist->profileimg)
<img  src="{{ $userlist->profileimg }}"></img>
@else
<img  src="{{ url('images/userchat.jpg') }}"></img>
@endif
<p>{{ $row->message }}</p>
<small><i class="zmdi zmdi-time"></i>{{ $row->created_at }}</small>
</div>
</div>
@endif
@if($row->reply!="")
<div class="messages__item messages__item--right">
<div class="messages__details">
<img src="{{ url('images/adminchat.jpg') }}"></img>
<p>{{ $row->reply }}</p>
<small><i class="zmdi zmdi-time"></i> {{ $row->created_at }}</small>
</div>
</div>
@endif
@endforeach
@endif
</div>
<div class="messages__reply">
<form method="post" action="{{ url('admin/tickets/adminsavechat') }}" id="chatform" enctype="multipart/form-data">
{{ csrf_field() }}
<input type="hidden" name="chat_id"  id="chat_id" value="{{ $chatlist[0]->ticketid }}">
<input type="hidden" name="userid"  id="userid" value="{{ $chatlist[0]->uid }}">
<div class="row">
<div class="col-md-11">
<textarea class="messages__reply__text message1 blacktxt" style="color:black !important" name="message" id="admin_support_textbox" placeholder="Type a message..." required></textarea>
</div>
<div class="col-md-1"><br>
<input type="hidden" name="csrf" value="sfa">
@if(in_array("write", explode(',',$AdminProfiledetails->support)))
<input type="button" name="add" class="btn btn-success adminchat" id="chatbtn" value="Send" style="position: relative;right: 45px;" />
@endif
</div>
</div>
</form>
</div>
</div>
</div>
</div>
</section>
@endsection
