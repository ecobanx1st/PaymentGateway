@include('email.header')

<tr>
    <td align='left'>Dear Customer,</td>
    <td style='text-align:center;font-size:20px;color:#515151;font-weight:600;'></td>
    <td align='left'>&nbsp;</td>
</tr>
<tr>
    <td colspan='3' align='center' height='1' style='padding:0px;'></td>
</tr>
<tr>
    <td align='left' style='padding-top:0px;'>Greetings from Eco Banx Pay!</td>
    <td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'></td>
    <td align='left' style='padding-top:0px;'>&nbsp;</td>
</tr>
<tr>
    <td colspan='3' height='1' style='padding:5px;'><?php print_r($msg) ; ?></td>
</tr>
<tr>
    <td align='left' style='padding-top:0px;'>&nbsp;</td>
</tr>
<tr>
    <td colspan='3' align='center' height='30' style='padding:0px;'></td>
</tr>

<tr>
    <td align='left' style='padding-bottom:0px;'>&nbsp;</td>
    <td></td>
    <td align='left' style='padding-bottom:0px;'>&nbsp;</td>
</tr>
<tr>
    <td colspan='3' align='center' height='3'
        style='text-align:left;font-size:15px;line-height:23px;color:#000;padding-bottom:0px;'>Thanks, <br />Regards
        <br />Customer Service Team, <br />{{ config('app.name') }} </td>
</tr>
<tr>
    <td colspan='3' align='center' height='15' style='padding:0px;'></td>
</tr>
<tr>
    <td colspan='3' align='center' height='15' style='padding:0px;'></td>
</tr>
<tr>
    <td colspan='3' height='50' style='text-align:center; background-color:#0788ed;padding:0px;'></td>
</tr>
</table>
</body>

</html>