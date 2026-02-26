@include('email.header')
<tr><td align='left'>&nbsp;</td><td style='text-align:center;font-size:20px;color:#515151;font-weight:600;'>Contact Us message from {{ config('app.name') }}</td><td align='left'>&nbsp;</td></tr>
<tr><td>Name :</td><td>{{ $request->name }}</td><td align='left'>&nbsp;</td></tr>
<tr><td>Email :</td><td>{{ $request->email }}</td><td align='left'>&nbsp;</td></tr>
<tr><td>Subject :</td><td>{{ $request->subject }}</td><td align='left'>&nbsp;</td></tr>
<tr><td>Phone No :</td><td>{{ $request->phone }}</td><td align='left'>&nbsp;</td></tr>
<tr><td>Message :</td><td colspan="2">{{ $request->Message }}</td></tr>
<tr><td colspan='3' align='center' height='30' style='padding:0px;'></td></tr>


@include('email.footer')